// babel.config.js
module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        // ... andere Plugins
        'react-native-reanimated/plugin', // Diesen Eintrag hinzufügen (muss der LETZTE Plugin sein)
      ],
    };
  };