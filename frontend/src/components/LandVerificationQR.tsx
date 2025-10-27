import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, Button, Space, Typography, Divider, Descriptions, Tag, message } from 'antd'
import { QrcodeOutlined, CopyOutlined, DownloadOutlined, LinkOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export interface LandVerificationData {
    landId: number
    owner: string
    jurisdiction: string
    metadataHash: string
    contractAddress: string
    timestamp: string
    transactionHash?: string
}

interface LandVerificationQRProps {
    data: LandVerificationData
    onClose?: () => void
}

export const LandVerificationQR = ({ data, onClose }: LandVerificationQRProps) => {
    const [verificationUrl, setVerificationUrl] = useState('')

    useEffect(() => {
        // Create verification URL with all land data
        const verificationData = {
            landId: data.landId,
            owner: data.owner,
            jurisdiction: data.jurisdiction,
            metadataHash: data.metadataHash,
            contractAddress: data.contractAddress,
            timestamp: data.timestamp,
            transactionHash: data.transactionHash,
            network: 'aptos-devnet',
            type: 'land_registry'
        }

        // Create base64 encoded verification data
        const encoded = btoa(JSON.stringify(verificationData))
        const url = `${window.location.origin}/verify?data=${encoded}`
        setVerificationUrl(url)
    }, [data])

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(verificationUrl)
        message.success('Verification URL copied to clipboard!')
    }

    const handleDownloadQR = () => {
        const canvas = document.querySelector('canvas')
        if (canvas) {
            const url = canvas.toDataURL('image/png')
            const link = document.createElement('a')
            link.href = url
            link.download = `land-${data.landId}-verification.png`
            link.click()
            message.success('QR code downloaded!')
        }
    }

    return (
        <Card
            title={
                <Space>
                    <QrcodeOutlined />
                    <span>Land Verification QR Code</span>
                </Space>
            }
            style={{ maxWidth: 600, margin: '0 auto' }}
            extra={onClose && <Button onClick={onClose}>Close</Button>}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Land Information */}
                <div>
                    <Descriptions title="Land Details" bordered column={1} size="small">
                        <Descriptions.Item label="Land ID">
                            {data.landId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Owner">
                            <Text copyable style={{ fontFamily: 'monospace' }}>
                                {data.owner}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Jurisdiction">
                            {data.jurisdiction}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color="green">Registered</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Registered At">
                            {new Date(data.timestamp).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                <Divider>Verification QR Code</Divider>

                {/* QR Code */}
                <div style={{ textAlign: 'center' }}>
                    <QRCodeSVG
                        value={verificationUrl}
                        size={256}
                        level="H"
                        includeMargin={true}
                        style={{ border: '8px solid white', borderRadius: '8px' }}
                    />
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">
                        Scan this QR code to verify land ownership on the blockchain
                    </Text>
                </div>

                {/* Action Buttons */}
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                        type="primary"
                        icon={<CopyOutlined />}
                        onClick={handleCopyUrl}
                        block
                    >
                        Copy Verification URL
                    </Button>

                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleDownloadQR}
                        block
                    >
                        Download QR Code
                    </Button>

                    <Button
                        icon={<LinkOutlined />}
                        href={verificationUrl}
                        target="_blank"
                        block
                    >
                        Open Verification Page
                    </Button>
                </Space>

                {/* Verification Info */}
                <div style={{ 
                    padding: '12px', 
                    background: '#f0f9ff', 
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                        📋 How to Verify:
                    </Text>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px' }}>
                        <li>Scan the QR code with any QR scanner</li>
                        <li>Or share the verification URL directly</li>
                        <li>Verification page will show blockchain-verified ownership</li>
                        <li>Anyone can verify without needing a wallet</li>
                    </ul>
                </div>

                {/* Blockchain Info */}
                <div style={{ 
                    padding: '12px', 
                    background: '#fffbeb', 
                    borderRadius: '8px',
                    border: '1px solid #fde68a'
                }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                        🔗 Blockchain Information:
                    </Text>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                            <Text type="secondary">Contract: </Text>
                            <Text copyable code style={{ fontSize: '11px' }}>
                                {data.contractAddress.slice(0, 20)}...
                            </Text>
                        </div>
                        {data.transactionHash && (
                            <div>
                                <Text type="secondary">Transaction: </Text>
                                <Text 
                                    copyable 
                                    code 
                                    style={{ fontSize: '11px' }}
                                    href={`https://explorer.aptoslabs.com/txn/${data.transactionHash}?network=devnet`}
                                >
                                    {data.transactionHash.slice(0, 20)}...
                                </Text>
                            </div>
                        )}
                        <div>
                            <Text type="secondary">Network: </Text>
                            <Tag color="blue">Aptos Devnet</Tag>
                        </div>
                    </Space>
                </div>
            </Space>
        </Card>
    )
}

export default LandVerificationQR

