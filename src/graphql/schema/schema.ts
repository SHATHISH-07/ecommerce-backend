import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import path from 'path';

const typesArray = loadFilesSync(path.join(__dirname), { extensions: ['graphql'] });

const typeDefs = mergeTypeDefs(typesArray);

export default typeDefs;
