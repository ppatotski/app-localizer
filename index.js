const Transform = require("stream").Transform;
const fs = require("fs");
const path = require("path");
const messageParser = require("intl-messageformat-parser");
const localizer = require("./localizer.js").AppLocalizer;

/**
 * @typedef GeneratorOptions
 * @type {Object}
 * @property {number} expander Sentance expanding factor (0.3 = 30%).
 * @property {number} wordexpander Word expanding factor (0.5 = 50%).
 * @property {boolean} accents Convert letter to its accent version.
 * @property {boolean} exclamations Enclose in exclamations.
 * @property {boolean} brackets Enclose in brackets.
 * @property {boolean} rightToLeft Left-to-Right.
 * @property {boolean} forceException throw syntax exception if any.
 *
 * @typedef PseudoLocalizerOptions
 * @property {number} expander Sentance expanding factor (0.3 = 30%).
 * @property {number} wordexpander Word expanding factor (0.5 = 50%).
 * @property {boolean} accents Convert letter to its accent version.
 * @property {boolean} exclamations Enclose in exclamations.
 * @property {boolean} brackets Enclose in brackets.
 * @property {boolean} rightToLeft Left-to-Right.
 * @property {string} format Structure of locale file content (polymer, angular.flat).
 * @property {string} pseudoLocaleName Name of pseudo locale.
 *
 * @typedef ValidateOptions
 * @property {boolean} multiFile Locale is localed in separate file.
 * @property {string} fileStructure Structure of locale file content (polymer, angular.flat).
 */

/**
 * Generates pseudo text.
 *
 * @param {string} text Input text.
 * @param {GeneratorOptions} options Generator options
 * @returns {string} Pseudo generated text
 */
function toPseudoText(text, options) {
	return localizer.toPseudoText(text, options, messageParser);
}

exports.toPseudoText = toPseudoText;

/**
 * Generates pseudo locale.
 *
 * @param {PseudoLocalizerOptions} options Generator options.
 * @param {string} text Input json file content.
 * @returns {string} Pseudo generated json content.
 */
function pseudoLocalizeContent(options, text) {
	return localizer.pseudoLocalizeContent(options, text, messageParser);
}

exports.pseudoLocalizeContent = pseudoLocalizeContent;

/**
 * Generates pseudo locale (gulp).
 *
 * @param {PseudoLocalizerOptions} options Generator options.
 * @returns {Transform}
 */
function pseudoLocalize(options) {
	return new Transform({
		objectMode: true,
		transform: function(file, enc, callback) {
			if (file.isNull()) {
				return callback(null, file);
			}
			file.contents = new Buffer(pseudoLocalizeContent(options, file.contents));
			return callback(null, file);
		}
	});
}

exports.pseudoLocalize = pseudoLocalize;

/**
 * Validates locales for missing labels.
 *
 * @param {Object} locales Object with all locales.
 * @param {Object} baseLocale Locale that is used as a base for validating against to
 * (do not specify in case of validating all against all).
 * @returns {Object} Validation result.
 */
function validateLocalesContent(locales, baseLocale) {
	let result = undefined;
	if (!baseLocale) {
		baseLocale = locales;
	}
	Object.keys(baseLocale).forEach(localeName => {
		Object.keys(baseLocale[localeName]).forEach(label => {
			Object.keys(locales)
				.filter(key => key !== localeName)
				.forEach(otherLocaleName => {
					if (
						!Object.keys(locales[otherLocaleName]).some(
							otherLabel => otherLabel === label
						)
					) {
						if (!result) {
							result = {};
						}
						if (!result[localeName]) {
							result[localeName] = {};
						}
						if (!result[localeName][label]) {
							result[localeName][label] = [];
						}
						result[localeName][label].push(otherLocaleName);
					}
				});
		});
	});
	return result;
}

exports.validateLocalesContent = validateLocalesContent;

/**
 * Validates locales for missing labels.
 *
 * @param {string} filePath Path to locale files.
 * @param {ValidateOptions} options Validate options.
 * @param {Object} baseLocale Locale that is used as a base for validating against to
 * (do not specify in case of validating all against all).
 * @param {function} callback Function callback with result of errors as a first parameter (result is undefined in case of success).
 */
function validateLocales(filePath, options, baseLocale, callback) {
	if (options.multiFile) {
		fs.readdir(filePath, (err, files) => {
			if (err) {
				console.error(err);
				callback();
			} else {
				const noLocaleKey = options.fileStructure === "angular.flat";
				const locales = {};
				let fileCount = files.length;
				files.forEach(file => {
					fs.readFile(path.join(filePath, file), (err, buffer) => {
						fileCount -= 1;
						const locale = JSON.parse(buffer);
						const localeName = noLocaleKey
							? file.substring(0, file.lastIndexOf("."))
							: Object.keys(locale)[0];
						locales[localeName] = noLocaleKey ? locale : locale[localeName];
						if (!fileCount) {
							const result = validateLocalesContent(
								locales,
								noLocaleKey && baseLocale ? { base: baseLocale } : baseLocale
							);
							callback(result);
						}
					});
				});
			}
		});
	} else {
		fs.readFile(filePath, (err, buffer) => {
			if (err) {
				console.error(err);
				callback();
			} else {
				const result = validateLocalesContent(JSON.parse(buffer));
				callback(result);
			}
		});
	}
}

exports.validateLocales = validateLocales;

/**
 * Validates locales for missing labels in multiple folders.
 *
 * @param {string[]} paths Paths to locale files.
 * @param {ValidateOptions} options Validate options.
 * @param {Object} baseLocale Locale that is used as a base for validating against to
 * (do not specify in case of validating all against all).
 * @param {function} callback Function callback with result of errors as a first parameter (result is undefined in case of success).
 * @returns {Object} Promise.
 */
function validateMultipleLocales(paths, options, baseLocale, callback) {
	return Promise.all(
		// Proceed when all paths (buckets) are processed
		paths.map(
			path =>
				new Promise(resolve => {
					validateLocales(path, options, baseLocale, result => {
						resolve({ path, result });
					});
				})
		)
	).then(values => {
		let overallResult = undefined; // undefined means valid
		values.forEach(value => {
			if (value.result) {
				if (!overallResult) {
					overallResult = {};
				}
				// result per path (bucket)
				overallResult[value.path] = value.result;
			}
		});
		if (callback) {
			callback(overallResult);
		} else {
			if (overallResult) {
				// last chance to say that locales are not valid
				throw overallResult;
			}
		}
	});
}

exports.validateMultipleLocales = validateMultipleLocales;
