const getMockFn = (defaultBehavior) => {
  const jestObj = typeof jest !== 'undefined' ? jest : null;
  if (jestObj) {
    return jestObj.fn(defaultBehavior);
  }
  return defaultBehavior;
};

module.exports = getMockFn((options) => ({
  id: 'google',
  name: 'Google',
  type: 'oauth',
  ...options,
}));
