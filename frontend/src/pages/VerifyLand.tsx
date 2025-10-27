import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Descriptions, Tag, Space, Typography, Spin, Alert, Button, Divider } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, LinkOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

export const VerifyLand = () => {
    const [searchParams] = useSearchParams()
    const [verificationData, setVerificationData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [verified, setVerified] = useState(false)
    const [landInfo, setLandInfo] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const verifyLand = async () => {
            try {
                // Get verification data from URL
                const dataParam = searchParams.get('data')
                if (!dataParam) {
                    setError('No verification data provided')
                    setLoading(false)
                    return
                }

                // Decode the verification data
                const decoded = JSON.parse(atob(dataParam))
                setVerificationData(decoded)

                // Verify on blockchain
                const response = await fetch(`https://fullnode.devnet.aptoslabs.com/v1/view`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        function: `${decoded.contractAddress}::land_registry::get_land_info`,
                        type_arguments: [],
                        arguments: [decoded.contractAddress, decoded.landId.toString()]
                    })
                })

                const result = await response.json()

                if (result && result[0]) {
                    const blockchainData = result[0]
                    const isOwnerMatch = blockchainData[1] === decoded.owner
                    const isJurisdictionMatch = blockchainData[2] === decoded.jurisdiction
                    
                    setVerified(isOwnerMatch && isJurisdictionMatch)
                    setLandInfo({
                        id: blockchainData[0],
                        owner: blockchainData[1],
                        jurisdiction: blockchainData[2],
                        metadataHash: blockchainData[3],
                        status: blockchainData[4],
                        registeredAt: blockchainData[5]
                    })
                } else {
                    setVerified(false)
                }
            } catch (err: any) {
                console.error('Verification error:', err)
                setError(err.message || 'Verification failed')
            } finally {
                setLoading(false)
            }
        }

        verifyLand()
    }, [searchParams])

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '50vh' 
            }}>
                <Space direction="vertical" align="center">
                    <Spin size="large" />
                    <Text>Verifying land ownership on blockchain...</Text>
                </Space>
            </div>
        )
    }

    if (error || !verificationData) {
        return (
            <Card style={{ maxWidth: 800, margin: '40px auto' }}>
                <Alert
                    message="Verification Error"
                    description={error || 'Invalid verification data'}
                    type="error"
                    showIcon
                />
            </Card>
        )
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: 900, margin: '0 auto' }}>
            <Card>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {/* Header */}
                    <div style={{ textAlign: 'center' }}>
                        {verified ? (
                            <>
                                <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
                                <Title level={2} style={{ marginTop: '16px' }}>
                                    Land Ownership Verified
                                </Title>
                                <Text type="success" strong>
                                    This land is verified on the Aptos blockchain
                                </Text>
                            </>
                        ) : (
                            <>
                                <CloseCircleOutlined style={{ fontSize: '64px', color: '#ff4d4f' }} />
                                <Title level={2} style={{ marginTop: '16px' }}>
                                    Verification Failed
                                </Title>
                                <Text type="danger">
                                    Could not verify land ownership on the blockchain
                                </Text>
                            </>
                        )}
                    </div>

                    <Divider />

                    {/* Verification Details */}
                    <Descriptions title="Verification Details" bordered>
                        <Descriptions.Item label="Status">
                            <Tag color={verified ? 'green' : 'red'}>
                                {verified ? 'Verified' : 'Failed'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Land ID">
                            {verificationData.landId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Network">
                            <Tag color="blue">Aptos Devnet</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Contract Address">
                            <Text copyable code style={{ fontSize: '12px' }}>
                                {verificationData.contractAddress}
                            </Text>
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Land Information from Blockchain */}
                    {landInfo && (
                        <>
                            <Divider>Blockchain Data</Divider>
                            <Descriptions title="Registered Land Information" bordered>
                                <Descriptions.Item label="Land ID">
                                    {landInfo.id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Owner">
                                    <Text copyable code>
                                        {landInfo.owner}
                                    </Text>
                                    {verificationData.owner === landInfo.owner && (
                                        <Tag color="green" style={{ marginLeft: '8px' }}>
                                            Matches
                                        </Tag>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Jurisdiction">
                                    {landInfo.jurisdiction}
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color={
                                        landInfo.status === '0' ? 'green' : 
                                        landInfo.status === '1' ? 'orange' : 'red'
                                    }>
                                        {landInfo.status === '0' ? 'Active' : 
                                         landInfo.status === '1' ? 'Frozen' : 'Disputed'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Metadata Hash">
                                    <Text code style={{ fontSize: '11px' }}>
                                        {landInfo.metadataHash}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Registered At">
                                    {new Date(parseInt(landInfo.registeredAt) / 1000).toLocaleString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </>
                    )}

                    {/* Original Data */}
                    <Divider>Original Registration Data</Divider>
                    <Descriptions bordered>
                        <Descriptions.Item label="Claimed Owner">
                            <Text copyable code style={{ fontSize: '12px' }}>
                                {verificationData.owner}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Jurisdiction">
                            {verificationData.jurisdiction}
                        </Descriptions.Item>
                        <Descriptions.Item label="Timestamp">
                            {new Date(verificationData.timestamp).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Blockchain Explorer Link */}
                    {verificationData.transactionHash && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <Button
                                type="link"
                                icon={<LinkOutlined />}
                                href={`https://explorer.aptoslabs.com/txn/${verificationData.transactionHash}?network=devnet`}
                                target="_blank"
                                size="large"
                            >
                                View Transaction on Aptos Explorer
                            </Button>
                        </div>
                    )}

                    {/* Verification Info */}
                    <div style={{
                        padding: '16px',
                        background: '#f0f9ff',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd'
                    }}>
                        <Paragraph>
                            <Text strong>ℹ️ About This Verification:</Text>
                        </Paragraph>
                        <ul>
                            <li>Data is retrieved directly from the Aptos blockchain</li>
                            <li>No third-party verification required</li>
                            <li>Ownership is cryptographically secure</li>
                            <li>This page can be bookmarked for future reference</li>
                        </ul>
                    </div>
                </Space>
            </Card>
        </div>
    )
}

export default VerifyLand

