const getMockFn = (defaultBehavior) => {
  const jestObj = typeof jest !== 'undefined' ? jest : null;
  if (jestObj) {
    return jestObj.fn(defaultBehavior);
  }
  return defaultBehavior;
};

const NextAuth = getMockFn(() => ({
  handlers: { 
    GET: getMockFn(() => Promise.resolve(new Response())), 
    POST: getMockFn(() => Promise.resolve(new Response())) 
  },
  auth: getMockFn(() => Promise.resolve(null)),
  signIn: getMockFn(() => Promise.resolve(true)),
  signOut: getMockFn(() => Promise.resolve(true)),
}));

module.exports = NextAuth;
