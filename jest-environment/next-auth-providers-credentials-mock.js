const getMockFn = (defaultBehavior) => {
  const jestObj = typeof jest !== 'undefined' ? jest : null;
  if (jestObj) {
    return jestObj.fn(defaultBehavior);
  }
  return defaultBehavior;
};

module.exports = getMockFn((options) => ({
  id: 'credentials',
  name: 'Credentials',
  type: 'credentials',
  ...options,
}));
