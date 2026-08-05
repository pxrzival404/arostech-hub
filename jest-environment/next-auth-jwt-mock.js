const getMockFn = (defaultBehavior) => {
  const jestObj = typeof jest !== 'undefined' ? jest : null;
  if (jestObj) {
    return jestObj.fn(defaultBehavior);
  }
  return defaultBehavior;
};

module.exports = {
  getToken: getMockFn(() => Promise.resolve(null))
};
