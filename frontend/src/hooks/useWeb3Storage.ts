import { useState, useCallback } from 'react'
import { Client } from '@storacha/client'

// Web3.Storage (now Storacha) configuration
const WEB3_STORAGE_TOKEN = process.env.REACT_APP_WEB3_STORAGE_TOKEN || ''

// Initialize the client
const client = new Client({ token: WEB3_STORAGE_TOKEN })

export interface UploadResult {
  cid: string
  url: string
  size: number
}

export interface LandDocument {
  file: File
  type: 'deed' | 'survey' | 'photos' | 'metadata'
  name: string
}

export const useWeb3Storage = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Upload a single file to Web3.Storage
  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload file to Web3.Storage
      const cid = await client.uploadFile(file, {
        onUploadProgress: (progress) => {
          setUploadProgress(progress.percent)
        }
      })

      const result: UploadResult = {
        cid: cid.toString(),
        url: `https://w3s.link/ipfs/${cid}`,
        size: file.size
      }

      console.log('File uploaded successfully:', result)
      return result

    } catch (error) {
      console.error('Web3.Storage upload failed:', error)
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [])

  // Upload multiple files to Web3.Storage
  const uploadFiles = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload multiple files
      const cid = await client.uploadFiles(files, {
        onUploadProgress: (progress) => {
          setUploadProgress(progress.percent)
        }
      })

      // For multiple files, we get a directory CID
      const results: UploadResult[] = files.map((file, index) => ({
        cid: cid.toString(),
        url: `https://w3s.link/ipfs/${cid}/${file.name}`,
        size: file.size
      }))

      console.log('Files uploaded successfully:', results)
      return results

    } catch (error) {
      console.error('Web3.Storage upload failed:', error)
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [])

  // Upload land documents with metadata
  const uploadLandDocuments = useCallback(async (documents: LandDocument[]): Promise<{
    metadata: UploadResult
    documents: Record<string, UploadResult>
  }> => {
    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload individual documents
      const documentResults: Record<string, UploadResult> = {}
      
      for (const doc of documents) {
        if (doc.type !== 'metadata') {
          const result = await uploadFile(doc.file)
          documentResults[doc.type] = result
        }
      }

      // Create metadata JSON
      const metadata = {
        title: "Land Registry Document",
        description: "Land documents stored on IPFS via Web3.Storage",
        documents: documentResults,
        uploaded_at: new Date().toISOString(),
        storage_provider: "Web3.Storage (Storacha)",
        version: "1.0"
      }

      // Create metadata file
      const metadataFile = new File(
        [JSON.stringify(metadata, null, 2)],
        'land-metadata.json',
        { type: 'application/json' }
      )

      // Upload metadata
      const metadataResult = await uploadFile(metadataFile)

      return {
        metadata: metadataResult,
        documents: documentResults
      }

    } catch (error) {
      console.error('Land documents upload failed:', error)
      throw new Error(`Land documents upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [uploadFile])

  // Get file from Web3.Storage
  const getFile = useCallback(async (cid: string): Promise<Response> => {
    try {
      const response = await fetch(`https://w3s.link/ipfs/${cid}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }
      return response
    } catch (error) {
      console.error('Failed to get file from Web3.Storage:', error)
      throw error
    }
  }, [])

  // Get file URL
  const getFileUrl = useCallback((cid: string): string => {
    return `https://w3s.link/ipfs/${cid}`
  }, [])

  // Verify file exists
  const verifyFile = useCallback(async (cid: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://w3s.link/ipfs/${cid}`, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      console.error('Failed to verify file:', error)
      return false
    }
  }, [])

  return {
    uploadFile,
    uploadFiles,
    uploadLandDocuments,
    getFile,
    getFileUrl,
    verifyFile,
    uploading,
    uploadProgress
  }
}

export default useWeb3Storage
