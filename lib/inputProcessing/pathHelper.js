"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNonEnforced = exports.isEnforced = exports.getAllAssignmentInPaths = exports.getAllPolicyAssignmentPaths = exports.getAllInitiativesPaths = exports.getAllPolicyDefinitionPaths = void 0;
const glob = __importStar(require("glob"));
const minimatch_1 = __importDefault(require("minimatch"));
const path = __importStar(require("path"));
const core = __importStar(require("@actions/core"));
const Inputs = __importStar(require("./inputs"));
const policyHelper_1 = require("../azure/policyHelper");
const utilities_1 = require("../utils/utilities");
/**
  * @returns All the directories that:
  *          1) Match any pattern given in paths input.
  *          2) Do not match any pattern given in ignore-paths input.
  *          3) Contain policy.json files.
  */
function getAllPolicyDefinitionPaths() {
    core.debug('Looking for policy definition paths to include...');
    const policyPathsToInclude = getPolicyPathsMatchingPatterns(Inputs.includePathPatterns, policyHelper_1.POLICY_FILE_NAME);
    core.debug('Looking for policy definition paths to ignore...');
    const policyPathsToExclude = getPolicyPathsMatchingPatterns(Inputs.excludePathPatterns, policyHelper_1.POLICY_FILE_NAME);
    const policyPaths = policyPathsToInclude.filter(p => !policyPathsToExclude.includes(p));
    const debugMessage = policyPaths.length > 0
        ? `Found the following policy paths that match the given path filters:\n\n${policyPaths.join('\n')}`
        : `Found no policies that match the given path filters.`;
    utilities_1.prettyDebugLog(debugMessage);
    return policyPaths;
}
exports.getAllPolicyDefinitionPaths = getAllPolicyDefinitionPaths;
/**
  * @returns All the directories that:
  *          1) Match any pattern given in paths input.
  *          2) Do not match any pattern given in ignore-paths input.
  *          3) Contain policyset.json files.
  */
function getAllInitiativesPaths() {
    core.debug('Looking for policy initiative paths to include...');
    const policyInitiativePathsToInclude = getPolicyPathsMatchingPatterns(Inputs.includePathPatterns, policyHelper_1.POLICY_INITIATIVE_FILE_NAME);
    core.debug('Looking for policy initiative paths to ignore...');
    const policyInitiativePathsToExclude = getPolicyPathsMatchingPatterns(Inputs.excludePathPatterns, policyHelper_1.POLICY_INITIATIVE_FILE_NAME);
    const policyInitiativePaths = policyInitiativePathsToInclude.filter(p => !policyInitiativePathsToExclude.includes(p));
    const debugMessage = policyInitiativePaths.length > 0
        ? `Found the following policy initiative paths that match the given path filters:\n\n${policyInitiativePaths.join('\n')}`
        : `Found no policy initiatives that match the given path filters.`;
    utilities_1.prettyDebugLog(debugMessage);
    return policyInitiativePaths;
}
exports.getAllInitiativesPaths = getAllInitiativesPaths;
/**
  * @returns All the files that:
  *          1) Match any pattern given in paths input.
  *          2) Do not match pattern given in ignore-paths input.
  *          3) Contain policy.json as a sibling.
  *          4) File name matches any pattern given in assignments input.
  */
function getAllPolicyAssignmentPaths() {
    core.debug('Looking for policy assignment paths to include...');
    const assignmentPathsToInclude = getAssignmentPathsMatchingPatterns(Inputs.includePathPatterns, Inputs.assignmentPatterns);
    core.debug('Looking for policy assignment paths to ignore...');
    const assignmentPathsToExclude = getAssignmentPathsMatchingPatterns(Inputs.excludePathPatterns, Inputs.assignmentPatterns);
    const assignmentPaths = assignmentPathsToInclude.filter(p => !assignmentPathsToExclude.includes(p));
    const debugMessage = assignmentPaths.length > 0
        ? `Found the following policy assignment paths that match the given path filters:\n\n${assignmentPaths.join('\n')}`
        : `Found no policy assignments that match the given path filters.`;
    utilities_1.prettyDebugLog(debugMessage);
    return assignmentPaths;
}
exports.getAllPolicyAssignmentPaths = getAllPolicyAssignmentPaths;
function getAllAssignmentInPaths(definitionFolderPaths) {
    return getAssignmentPathsMatchingPatterns(definitionFolderPaths, Inputs.assignmentPatterns);
}
exports.getAllAssignmentInPaths = getAllAssignmentInPaths;
function isEnforced(assignmentPath) {
    core.debug(`Checking if assignment path '${assignmentPath}' is set to enforce`);
    return Inputs.enforcePatterns.some(pattern => {
        const isMatch = minimatch_1.default(assignmentPath, pattern, { dot: true, matchBase: true });
        if (isMatch) {
            core.debug(`Assignment path '${assignmentPath}' matches pattern '${pattern}' for enforce`);
        }
        return isMatch;
    });
}
exports.isEnforced = isEnforced;
function isNonEnforced(assignmentPath) {
    core.debug(`Checking if assignment path '${assignmentPath}' is set to do not enforce`);
    return Inputs.doNotEnforcePatterns.some(pattern => {
        const isMatch = minimatch_1.default(assignmentPath, pattern, { dot: true, matchBase: true });
        if (isMatch) {
            core.debug(`Assignment path '${assignmentPath}' matches pattern '~${pattern}' for do not enforce`);
        }
        return isMatch;
    });
}
exports.isNonEnforced = isNonEnforced;
function getPolicyPathsMatchingPatterns(patterns, policyFileName) {
    let matchingPolicyPaths = [];
    patterns.forEach(pattern => {
        const policyFilePattern = path.join(pattern, policyFileName);
        const policyFiles = getFilesMatchingPattern(policyFilePattern);
        core.debug(`Policy file pattern: ${policyFilePattern}\n Matching policy paths: ${policyFiles}`);
        matchingPolicyPaths.push(...policyFiles.map(policyFile => path.dirname(policyFile)));
    });
    return getUniquePaths(matchingPolicyPaths);
}
function getAssignmentPathsMatchingPatterns(patterns, assignmentPatterns) {
    let matchingAssignmentPaths = [];
    patterns.forEach(policyPath => {
        assignmentPatterns.forEach(assignmentPattern => {
            const pattern = path.join(policyPath, assignmentPattern);
            const assignmentPaths = getFilesMatchingPattern(pattern);
            core.debug(`Assignment pattern: ${pattern}\n Matching assignment paths: ${assignmentPaths}`);
            matchingAssignmentPaths.push(...assignmentPaths);
        });
    });
    return getUniquePaths(matchingAssignmentPaths);
}
function getFilesMatchingPattern(pattern) {
    return glob.sync(pattern, { dot: true });
}
function getUniquePaths(paths) {
    return [...new Set(paths)];
}
