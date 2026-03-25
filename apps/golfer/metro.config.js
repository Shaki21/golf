/**
 * Metro configuration for AK Golf Golfer App
 * https://facebook.github.io/metro/docs/configuration
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// Get workspace root
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    // We need to make sure Metro finds packages in the workspace
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // Ensure Metro can resolve the design system
    extraNodeModules: {
      '@iup/design-system': path.resolve(workspaceRoot, 'packages/design-system'),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
