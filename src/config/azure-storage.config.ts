export const azureStorageConfig = {
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  accountName: 'azureblobcmp',
  containerName: 'cmpdocs',
  sasToken: process.env.AZURE_STORAGE_SAS_TOKEN,
}; 