import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RFQFolder, RFQCartItem, ClientData } from "@/types";
import type { Subdomain, DEFAULT_SUBDOMAIN } from "@/lib/subdomain";

/** Special folder ID for individually submitted (satuan) RFQs */
export const SINGLE_RFQ_FOLDER_ID = "single-rfq-satuan";

interface RFQState {
  folders: RFQFolder[];
  savedClientData: ClientData | null;
  saveClientDataForNext: boolean;

  // Folder actions
  createFolder: (name: string, description?: string, subdomain?: string) => string;
  updateFolder: (folderId: string, name: string, description?: string) => void;
  deleteFolder: (folderId: string) => void;
  markFolderAsSubmitted: (folderId: string, rfqId: string) => void;

  // Item actions
  addItemToFolder: (folderId: string, item: RFQCartItem) => void;
  removeItemFromFolder: (folderId: string, productId: string) => void;
  updateItemQuantity: (
    folderId: string,
    productId: string,
    quantity: number
  ) => void;

  // Quick add (creates "Umum" folder if none exists for this subdomain)
  addItemToRFQ: (item: RFQCartItem, subdomain?: string) => string;

  // Client data
  setSavedClientData: (data: ClientData) => void;
  clearSavedClientData: () => void;
  setSaveClientDataForNext: (save: boolean) => void;

  // Single-item submitted RFQ tracking — adds product to the "RFQ Satuan" folder
  addSubmittedSingleItem: (item: RFQCartItem, rfqId: string, subdomain?: string) => void;

  // Legacy — kept to avoid breaking existing stored data, but no longer called
  addSubmittedItemToStore: (rfqId: string) => void;

  // Helpers
  getFolderById: (folderId: string) => RFQFolder | undefined;
  getTotalItems: () => number;
  getFolderItemCount: (folderId: string) => number;
  getFoldersForSubdomain: (subdomain: string) => RFQFolder[];
}

export const useRFQStore = create<RFQState>()(
  persist(
    (set, get) => ({
      folders: [],
      savedClientData: null,
      saveClientDataForNext: false,

      // Folder actions
      createFolder: (name, description = "", subdomain?) => {
        const id = `folder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const now = new Date().toISOString();
        const folder: RFQFolder = {
          id,
          name,
          description,
          items: [],
          createdAt: now,
          updatedAt: now,
          subdomain: subdomain || "pju",
        };
        set((state) => ({ folders: [...state.folders, folder] }));
        return id;
      },

      updateFolder: (folderId, name, description) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId
              ? {
                  ...f,
                  name,
                  description: description ?? f.description,
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      deleteFolder: (folderId) => {
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== folderId),
        }));
      },

      markFolderAsSubmitted: (folderId, rfqId) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId
              ? {
                  ...f,
                  submittedAt: new Date().toISOString(),
                  submittedRFQId: rfqId,
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      // Item actions
      addItemToFolder: (folderId, item) => {
        set((state) => ({
          folders: state.folders.map((f) => {
            if (f.id !== folderId) return f;
            const existingIndex = f.items.findIndex(
              (i) => i.productId === item.productId
            );
            let newItems: RFQCartItem[];
            if (existingIndex >= 0) {
              // Product already in folder, increment quantity
              newItems = f.items.map((i, idx) =>
                idx === existingIndex
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              );
            } else {
              newItems = [...f.items, item];
            }
            return {
              ...f,
              items: newItems,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeItemFromFolder: (folderId, productId) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId
              ? {
                  ...f,
                  items: f.items.filter((i) => i.productId !== productId),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      updateItemQuantity: (folderId, productId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId
              ? {
                  ...f,
                  items: f.items.map((i) =>
                    i.productId === productId ? { ...i, quantity } : i
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        }));
      },

      // Quick add — creates "Umum" folder if none exists for this subdomain
      addItemToRFQ: (item, subdomain?) => {
        const sd = subdomain || "pju";
        const state = get();
        const sdFolders = state.folders.filter(
          (f) => f.subdomain === sd && f.id !== SINGLE_RFQ_FOLDER_ID
        );
        let folderId: string;

        if (sdFolders.length === 0) {
          folderId = get().createFolder("Proyek Umum", "Folder proyek default", sd);
        } else {
          folderId = sdFolders[0].id;
        }

        get().addItemToFolder(folderId, item);
        return folderId;
      },

      // ─── Single-item submitted RFQ tracking ───────────────────────────
      // Creates (or updates) the special "RFQ Satuan" folder with the
      // submitted product, each item carrying its own rfqId & submittedAt.
      addSubmittedSingleItem: (item: RFQCartItem, rfqId: string, subdomain?: string) => {
        const sd = subdomain || "pju";
        const now = new Date().toISOString();
        const submittedItem: RFQCartItem = {
          ...item,
          rfqId,
          submittedAt: now,
        };

        // Each subdomain gets its own "RFQ Satuan" folder
        const singleFolderId = `${SINGLE_RFQ_FOLDER_ID}-${sd}`;

        set((state) => {
          const existingIdx = state.folders.findIndex(
            (f) => f.id === singleFolderId
          );

          if (existingIdx < 0) {
            // Create the special folder with this first item
            const folder: RFQFolder = {
              id: singleFolderId,
              name: "RFQ Satuan",
              description: "Daftar produk yang diajukan secara individual",
              items: [submittedItem],
              createdAt: now,
              updatedAt: now,
              subdomain: sd,
            };
            return { folders: [...state.folders, folder] };
          }

          // Folder exists — append the new submitted item
          const updated = state.folders.map((f) => {
            if (f.id !== singleFolderId) return f;
            return {
              ...f,
              items: [...f.items, submittedItem],
              updatedAt: now,
            };
          });
          return { folders: updated };
        });
      },

      // Legacy — kept so existing persisted state doesn't break, but no longer actively called
      addSubmittedItemToStore: (_rfqId: string) => {
        // no-op — replaced by addSubmittedSingleItem
      },

      // Client data
      setSavedClientData: (data) => {
        set({ savedClientData: data });
      },

      clearSavedClientData: () => {
        set({ savedClientData: null });
      },

      setSaveClientDataForNext: (save) => {
        set({ saveClientDataForNext: save });
      },

      // Helpers
      getFolderById: (folderId) => {
        return get().folders.find((f) => f.id === folderId);
      },

      getTotalItems: () => {
        return get().folders.reduce((total, f) => total + f.items.length, 0);
      },

      getFolderItemCount: (folderId) => {
        const folder = get().folders.find((f) => f.id === folderId);
        return folder ? folder.items.length : 0;
      },

      getFoldersForSubdomain: (subdomain: string) => {
        return get().folders.filter((f) => {
          // If folder has no subdomain (legacy), treat as "pju"
          const folderSubdomain = f.subdomain || "pju";
          return folderSubdomain === subdomain;
        });
      },
    }),
    {
      name: "arostech-rfq-storage", // localStorage key
      partialize: (state) => ({
        folders: state.folders,
        savedClientData: state.savedClientData,
        saveClientDataForNext: state.saveClientDataForNext,
      }),
    }
  )
);
