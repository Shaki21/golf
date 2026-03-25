module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Add path alias support
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@screens': './screens',
          '@iup/design-system': '../../packages/design-system',
        },
      },
    ],
  ],
};
