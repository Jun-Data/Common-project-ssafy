module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            webpackConfig.module.rules = webpackConfig.module.rules.filter(
                (rule) => !(rule.loader && rule.loader.includes("source-map-loader"))
            );
            return webpackConfig;
        },
    },
};
