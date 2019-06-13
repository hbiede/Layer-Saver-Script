module.exports = {
    "env": {
        "es6": true,
        "browser": true
    },
    "extends": "airbnb-base",
    rules: {
        "linebreak-style": "off",
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "comma-dangle": ["error", "never"],
        "no-underscore-dangle": "off",
        "arrow-parens": ["error", "as-needed"],
        "no-prototype-builtins": "off",
        "max-len": "off",
        "no-param-reassign": "off",
        "no-plusplus": "off",
        "newline-per-chained-call": "off",
        "no-new": "off",
        "no-template-curly-in-string": "off",
        "no-alert": "off",
        "no-console": "off",
        "no-return-assign": ["error", "except-parens"],
        "no-restricted-globals": "off",
        "import/no-unresolved": "off",
        "no-use-before-define": "off",
        "global-require": "off",
        "no-cond-assign": ["error", "except-parens"],
        "prefer-destructuring": "off"
    }
};