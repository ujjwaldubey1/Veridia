import { useState, useEffect } from 'react'
import { Card, Descriptions, Tag, Space, Typography, Button, Row, Col, Empty, Skeleton, Divider, message } from 'antd'
import { 
    WalletOutlined, 
    EnvironmentOutlined, 
    CheckCircleOutlined, 
    FileTextOutlined,
    LinkOutlined,
    QrcodeOutlined,
    ClockCircleOutlined
} from '@ant-design/icons'
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { QRCodeSVG } from 'qrcode.react'
import LandVerificationQR, { type LandVerificationData } from '../components/LandVerificationQR'
import { REGISTRY_ADDRESS } from '../useLandRegistry'
import { Modal } from 'antd'

const { Title, Text, Paragraph } = Typography

interface Land {
    id: string
    owner: string
    jurisdiction: string
    metadataHash: string
    status: number
    registeredAt: string
}

export const MyPortfolio = () => {
    const { account } = useWallet()
    const [lands, setLands] = useState<Land[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLand, setSelectedLand] = useState<Land | null>(null)
    const [qrModalVisible, setQrModalVisible] = useState(false)
    const [totalLands, setTotalLands] = useState(0)

    // Fetch all lands owned by the connected user
    const fetchMyLands = async () => {
        if (!account?.address) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            
            // Get the next land ID to know how many lands exist
            const nextIdResponse = await fetch(`https://fullnode.devnet.aptoslabs.com/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: `${REGISTRY_ADDRESS}::land_registry::get_next_land_id`,
                    type_arguments: [],
                    arguments: [REGISTRY_ADDRESS]
                })
            })
            
            const nextIdData = await nextIdResponse.json()
            const maxLandId = parseInt(nextIdData[0]) - 1
            setTotalLands(maxLandId)

            // Fetch all lands and filter by owner
            const ownedLands: Land[] = []
            
            for (let i = 1; i <= maxLandId; i++) {
                try {
                    const response = await fetch(`https://fullnode.devnet.aptoslabs.com/v1/view`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            function: `${REGISTRY_ADDRESS}::land_registry::get_land_info`,
                            type_arguments: [],
                            arguments: [REGISTRY_ADDRESS, i.toString()]
                        })
                    })

                    const data = await response.json()
                    
                    if (data && data[0] && data[1]?.toLowerCase() === account.address.toLowerCase()) {
                        ownedLands.push({
                            id: data[0],
                            owner: data[1],
                            jurisdiction: data[2],
                            metadataHash: data[3],
                            status: parseInt(data[4]),
                            registeredAt: data[5]
                        })
                    }
                } catch (err) {
                    console.log(`Land ${i} not found or error:`, err)
                    // Continue to next land ID
                    break
                }
            }

            setLands(ownedLands)
        } catch (error) {
            console.error('Error fetching lands:', error)
            message.error('Failed to load your lands')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMyLands()
    }, [account?.address])

    const handleCardClick = (land: Land) => {
        setSelectedLand(land)
    }

    const handleGenerateQR = (land: Land) => {
        const verificationData: LandVerificationData = {
            landId: parseInt(land.id),
            owner: land.owner,
            jurisdiction: land.jurisdiction,
            metadataHash: land.metadataHash,
            contractAddress: REGISTRY_ADDRESS,
            timestamp: new Date(parseInt(land.registeredAt) / 1000).toISOString(),
        }
        setQrData(verificationData)
        setQrModalVisible(true)
    }

    const getStatusTag = (status: number) => {
        const statusMap: Record<number, { text: string; color: string }> = {
            0: { text: 'Active', color: 'green' },
            1: { text: 'Frozen', color: 'orange' },
            2: { text: 'Disputed', color: 'red' },
            3: { text: 'Invalidated', color: 'gray' },
        }
        const { text, color } = statusMap[status] || { text: 'Unknown', color: 'default' }
        return <Tag color={color}>{text}</Tag>
    }

    const formatDate = (timestamp: string) => {
        return new Date(parseInt(timestamp) / 1000).toLocaleString()
    }

    const [qrData, setQrData] = useState<LandVerificationData | null>(null)

    if (!account?.address) {
        return (
            <Card style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center' }}>
                <Empty
                    description="Connect your wallet to view your land portfolio"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </Card>
        )
    }

    if (loading) {
        return (
            <div style={{ padding: '20px' }}>
                <Card>
                    <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
            </div>
        )
    }

    return (
        <div style={{ padding: '20px', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <Card style={{ marginBottom: '24px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Space align="baseline">
                        <WalletOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                        <Title level={2} style={{ margin: 0 }}>My Land Portfolio</Title>
                    </Space>
                    
                    <Descriptions column={3} bordered size="small">
                        <Descriptions.Item label="Wallet Address">
                            <Text copyable code>{account.address}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Lands">
                            <Tag color="blue" style={{ fontSize: '16px' }}>{lands.length}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Network">
                            <Tag color="purple">Aptos Devnet</Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </Space>
            </Card>

            {/* Land Cards Grid */}
            {lands.length === 0 ? (
                <Card>
                    <Empty
                        description="You haven't registered any lands yet"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            ) : (
                <Row gutter={[16, 16]}>
                    {lands.map((land) => (
                        <Col xs={24} sm={12} lg={8} key={land.id}>
                            <Card
                                hoverable
                                style={{ height: '100%' }}
                                onClick={() => handleCardClick(land)}
                                actions={[
                                    <Button
                                        type="link"
                                        icon={<QrcodeOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleGenerateQR(land)
                                        }}
                                    >
                                        QR Code
                                    </Button>,
                                ]}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text strong style={{ fontSize: '18px' }}>
                                            Land #{land.id}
                                        </Text>
                                        {getStatusTag(land.status)}
                                    </div>
                                    
                                    <Divider style={{ margin: '12px 0' }} />
                                    
                                    <Descriptions column={1} size="small" bordered>
                                        <Descriptions.Item label={<EnvironmentOutlined />}>
                                            {land.jurisdiction}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<ClockCircleOutlined />}>
                                            {formatDate(land.registeredAt)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={<FileTextOutlined />}>
                                            <Text code style={{ fontSize: '11px' }} ellipsis>
                                                {land.metadataHash}
                                            </Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Land Details Modal */}
            <Modal
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>Land #{selectedLand?.id} - Details</span>
                    </Space>
                }
                open={!!selectedLand}
                onCancel={() => setSelectedLand(null)}
                width={800}
                footer={[
                    <Button key="close" onClick={() => setSelectedLand(null)}>
                        Close
                    </Button>,
                    <Button
                        key="qr"
                        type="primary"
                        icon={<QrcodeOutlined />}
                        onClick={() => {
                            if (selectedLand) {
                                handleGenerateQR(selectedLand)
                            }
                        }}
                    >
                        Generate QR Code
                    </Button>,
                ]}
            >
                {selectedLand && (
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <Descriptions title="Ownership Information" bordered>
                            <Descriptions.Item label="Land ID">
                                <Text strong>{selectedLand.id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Owner">
                                <Text copyable code>{selectedLand.owner}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Jurisdiction">
                                <EnvironmentOutlined /> {selectedLand.jurisdiction}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                {getStatusTag(selectedLand.status)}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="Blockchain Data" bordered>
                            <Descriptions.Item label="Registered At">
                                <ClockCircleOutlined /> {formatDate(selectedLand.registeredAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Metadata Hash">
                                <Text code style={{ fontSize: '12px' }}>
                                    {selectedLand.metadataHash}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Contract Address">
                                <Text copyable code style={{ fontSize: '12px' }}>
                                    {REGISTRY_ADDRESS}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{
                            padding: '12px',
                            background: '#f0f9ff',
                            borderRadius: '8px',
                            border: '1px solid #bae6fd'
                        }}>
                            <Paragraph>
                                <Text strong>ℹ️ About This Land:</Text>
                            </Paragraph>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Ownership verified on Aptos blockchain</li>
                                <li>Immutable record - cannot be altered</li>
                                <li>Document metadata stored on IPFS</li>
                                <li>Generate QR code for public verification</li>
                            </ul>
                        </div>
                    </Space>
                )}
            </Modal>

            {/* QR Code Modal */}
            <Modal
                title="Land Verification QR Code"
                open={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={null}
                width={700}
                centered
            >
                {qrData && <LandVerificationQR data={qrData} onClose={() => setQrModalVisible(false)} />}
            </Modal>
        </div>
    )
}

export default MyPortfolio

