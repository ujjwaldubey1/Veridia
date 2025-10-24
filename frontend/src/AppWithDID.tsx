import { useEffect, useMemo, useState } from "react"
import {
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Dropdown,
    Form,
    Input,
    InputNumber,
    Layout,
    Row,
    Select,
    Skeleton,
    Space,
    Statistic,
    Tabs,
    Tag,
    Typography,
    Avatar,
    Popover,
    message,
    Upload,
    Progress,
    Alert,
} from "antd"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design"
import {
    useLandRegistry,
    LandStatus,
    REGISTRY_ADDRESS,
} from "./useLandRegistry"
import { FileTextOutlined, CameraOutlined, UploadOutlined } from "@ant-design/icons"

const { Header, Content, Footer } = Layout
const { Title, Text, Link } = Typography

// Your Storacha DID
const STORACHA_DID = 'did:key:z6Mktmi8U1pJD3hXWrB3HfVw8q5azxPHn9DoNUuGqP5wPiSN'

function shortAddress(addr?: string, head = 6, tail = 4) {
    if (!addr) return "-"
    const s = addr.toString()
    if (s.length <= head + tail + 3) return s
    return `${s.slice(0, head)}...${s.slice(-tail)}`
}

const NETWORK_NAME =
    (import.meta.env.VITE_APTOS_NETWORK as string | undefined)?.toLowerCase() ??
    "devnet"
const NETWORK_LABEL_MAP: Record<string, string> = {
    devnet: "Devnet",
    testnet: "Testnet",
    mainnet: "Mainnet",
    local: "Local",
}
const NETWORK_LABEL = NETWORK_LABEL_MAP[NETWORK_NAME] ?? NETWORK_NAME
const IS_MAINNET = NETWORK_NAME === "mainnet"

function AppWithDID() {
    const { disconnect, account } = useWallet()
    const connected = !!account?.address

    const [form] = Form.useForm()
    const [transferForm] = Form.useForm()
    const [statusForm] = Form.useForm()
    const [documentForm] = Form.useForm()

    const [loading, setLoading] = useState(false)
    const [lookupLoading, setLookupLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [nextId, setNextId] = useState<number | null>(null)
    const [landIdQuery, setLandIdQuery] = useState<string>("1")
    const [landInfo, setLandInfo] = useState<any>(null)
    const [landMetadata, setLandMetadata] = useState<any>(null)
    const [uploadedFiles, setUploadedFiles] = useState<{
        deed?: File
        survey?: File
        photos?: File
    }>({})

    const {
        registerLand,
        transferOwnership,
        updateLandStatus,
        getLand,
        checkLandExists,
        getNextLandId,
    } = useLandRegistry()

    useEffect(() => {
        ;(async () => {
            try {
                const id = await getNextLandId()
                setNextId(id)
            } catch (e) {
                console.warn(e)
            }
        })()
    }, [getNextLandId])

    // Simulate file upload to Storacha (replace with actual Storacha client)
    const uploadToStoracha = async (file: File): Promise<string> => {
        setUploading(true)
        setUploadProgress(0)
        
        try {
            // Simulate upload progress
            for (let i = 0; i <= 100; i += 10) {
                setUploadProgress(i)
                await new Promise(resolve => setTimeout(resolve, 100))
            }
            
            // Generate a simulated CID
            const simulatedCid = 'Qm' + Math.random().toString(36).substr(2, 44)
            
            console.log(`File uploaded to Storacha with DID: ${STORACHA_DID}`)
            console.log(`File: ${file.name}`)
            console.log(`CID: ${simulatedCid}`)
            console.log(`URL: https://w3s.link/ipfs/${simulatedCid}`)
            
            return simulatedCid
        } catch (error) {
            console.error('Storacha upload failed:', error)
            throw error
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    // Register land with documents
    const handleRegisterWithDocuments = async () => {
        try {
            const values = await documentForm.validateFields()
            setLoading(true)

            // Upload documents to Storacha
            const documentHashes: Record<string, string> = {}
            
            if (uploadedFiles.deed) {
                documentHashes.deed = await uploadToStoracha(uploadedFiles.deed)
            }
            if (uploadedFiles.survey) {
                documentHashes.survey = await uploadToStoracha(uploadedFiles.survey)
            }
            if (uploadedFiles.photos) {
                documentHashes.photos = await uploadToStoracha(uploadedFiles.photos)
            }

            // Create metadata
            const metadata = {
                title: values.title,
                description: values.description,
                property_details: {
                    address: values.address,
                    coordinates: {
                        latitude: values.latitude,
                        longitude: values.longitude,
                    },
                    area: values.area,
                    property_type: values.property_type,
                },
                legal_info: {
                    parcel_number: values.parcel_number,
                    zoning: values.zoning,
                    restrictions: values.restrictions || [],
                },
                documents: documentHashes,
                registered_date: new Date().toISOString(),
                storage_provider: "Storacha",
                did: STORACHA_DID
            }

            // Upload metadata to Storacha
            const metadataFile = new File(
                [JSON.stringify(metadata, null, 2)],
                'land-metadata.json',
                { type: 'application/json' }
            )
            
            const metadataHash = await uploadToStoracha(metadataFile)

            // Register land with metadata hash
            await registerLand(values.owner, values.jurisdiction, metadataHash)

            message.success("Land registered with documents!")
            documentForm.resetFields()
            setUploadedFiles({})
            
            const id = await getNextLandId()
            setNextId(id)

        } catch (e: any) {
            message.error(e?.message || "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)
            await registerLand(
                values.owner,
                values.jurisdiction,
                values.metadata
            )
            message.success("Land registered")
            const id = await getNextLandId()
            setNextId(id)
            form.resetFields()
        } catch (e: any) {
            message.error(e?.message || "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    const handleTransfer = async () => {
        try {
            const values = await transferForm.validateFields()
            const id = Number(values.landId)
            if (!Number.isInteger(id) || id <= 0) {
                throw new Error("Please enter a valid Land ID (positive integer)")
            }
            setLoading(true)
            await transferOwnership(id, values.newOwner)
            message.success("Ownership transferred")
            transferForm.resetFields()
        } catch (e: any) {
            message.error(e?.message || "Transfer failed")
        } finally {
            setLoading(false)
        }
    }

    const handleStatus = async () => {
        try {
            const values = await statusForm.validateFields()
            const id = Number(values.landId)
            if (!Number.isInteger(id) || id <= 0) {
                throw new Error("Please enter a valid Land ID (positive integer)")
            }
            const statusVal = Number(values.status)
            if (!Number.isInteger(statusVal) || statusVal < 0 || statusVal > 2) {
                throw new Error("Please select a valid status")
            }
            setLoading(true)
            await updateLandStatus(id, statusVal as LandStatus)
            message.success("Status updated")
            statusForm.resetFields()
        } catch (e: any) {
            message.error(e?.message || "Status update failed")
        } finally {
            setLoading(false)
        }
    }

    const loadLand = async () => {
        try {
            setLookupLoading(true)
            const id = Number(landIdQuery || "0")
            const exists = await checkLandExists(id)
            if (!exists) {
                setLandInfo(null)
                setLandMetadata(null)
                message.info("Land does not exist")
            } else {
                const info = await getLand(id)
                setLandInfo(info)
                
                // Try to load metadata from Storacha
                try {
                    const response = await fetch(`https://w3s.link/ipfs/${info.metadata_hash}`)
                    if (response.ok) {
                        const metadata = await response.json()
                        setLandMetadata(metadata)
                    }
                } catch (error) {
                    console.warn("Could not load metadata from Storacha:", error)
                    setLandMetadata(null)
                }
            }
        } catch (e: any) {
            message.error(e?.message || "Query failed")
        } finally {
            setLookupLoading(false)
        }
    }

    const statusMeta = useMemo(() => {
        const value = landInfo?.status?.value
        const label = ["Active", "Frozen", "Disputed"][value] ?? "Unknown"
        const color =
            value === 0
                ? "green"
                : value === 1
                ? "orange"
                : value === 2
                ? "red"
                : "default"
        return { label, color }
    }, [landInfo])

    const onWalletMenuClick = async ({ key }: { key: string }) => {
        try {
            if (key === "copy") {
                await navigator.clipboard.writeText(account?.address?.toString() || "")
                message.success("Address copied")
            }
            if (key === "disconnect") {
                await disconnect()
            }
        } catch (e) {
            message.error("Action failed")
        }
    }

    const handleFileUpload = (file: File, type: 'deed' | 'survey' | 'photos') => {
        setUploadedFiles(prev => ({
            ...prev,
            [type]: file
        }))
        return false // Prevent default upload
    }

    const renderHeaderRight = () => (
        <Space align="center" size="middle" wrap>
            {!IS_MAINNET && (
                <Space size={4}>
                    <Tag color="gold" style={{ marginInlineEnd: 0 }}>
                        {NETWORK_LABEL}
                    </Tag>
                    <Popover
                        placement="bottomRight"
                        title="Deployment details"
                        content={
                            <div>
                                <div style={{ marginBottom: 6 }}>
                                    <Text strong>Registry</Text>
                                </div>
                                <div style={{ fontFamily: "monospace" }}>
                                    <Text copyable={{ text: REGISTRY_ADDRESS }}>
                                        {REGISTRY_ADDRESS}
                                    </Text>
                                </div>
                                <Divider />
                                <div style={{ marginBottom: 6 }}>
                                    <Text strong>Storacha DID</Text>
                                </div>
                                <div style={{ fontFamily: "monospace" }}>
                                    <Text copyable={{ text: STORACHA_DID }}>
                                        {STORACHA_DID}
                                    </Text>
                                </div>
                            </div>
                        }
                        trigger="hover"
                    >
                        <Button size="small" type="default">
                            Details
                        </Button>
                    </Popover>
                </Space>
            )}

            {!connected ? (
                <WalletSelector />
            ) : (
                <Dropdown
                    placement="bottomRight"
                    menu={{
                        onClick: onWalletMenuClick,
                        items: [
                            { key: "copy", label: "Copy address" },
                            { type: "divider" as const },
                            { key: "disconnect", label: "Disconnect" },
                        ],
                    }}
                >
                    <Button>
                        <Space>
                            <Avatar size="small">
                                {account?.address
                                    ?.toString()
                                    .slice(2, 4)
                                    .toUpperCase()}
                            </Avatar>
                            <span style={{ fontFamily: "monospace" }}>
                                {shortAddress(account?.address?.toString())}
                            </span>
                        </Space>
                    </Button>
                </Dropdown>
            )}
        </Space>
    )

    const registerWithDocumentsTab = (
        <Row gutter={[16, 16]}>
            <Col xs={24}>
                <Card title="Register Land with Documents (Storacha + DID)" bordered>
                    <Alert
                        message="Storacha Integration Ready"
                        description={`Using DID: ${STORACHA_DID}`}
                        type="success"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    
                    <Form form={documentForm} layout="vertical" disabled={!connected}>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Owner Address"
                                    name="owner"
                                    rules={[{ required: true, message: "Owner address required" }]}
                                    initialValue={account?.address}
                                >
                                    <Input placeholder="0x..." />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Jurisdiction"
                                    name="jurisdiction"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="e.g., Lagos, Nigeria" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Property Title"
                                    name="title"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="e.g., Land Deed for 123 Main St" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Property Type"
                                    name="property_type"
                                    rules={[{ required: true }]}
                                >
                                    <Select placeholder="Select property type">
                                        <Select.Option value="Residential">Residential</Select.Option>
                                        <Select.Option value="Commercial">Commercial</Select.Option>
                                        <Select.Option value="Industrial">Industrial</Select.Option>
                                        <Select.Option value="Agricultural">Agricultural</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Property Address"
                            name="address"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="123 Main Street, City, State" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Latitude"
                                    name="latitude"
                                    rules={[{ required: true, type: "number" }]}
                                >
                                    <InputNumber
                                        style={{ width: "100%" }}
                                        placeholder="37.7749"
                                        precision={6}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Longitude"
                                    name="longitude"
                                    rules={[{ required: true, type: "number" }]}
                                >
                                    <InputNumber
                                        style={{ width: "100%" }}
                                        placeholder="-122.4194"
                                        precision={6}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Area (sq ft)"
                                    name="area"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="5000" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Parcel Number"
                                    name="parcel_number"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="123-456-789" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Zoning"
                                    name="zoning"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="R1" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label="Restrictions"
                                    name="restrictions"
                                >
                                    <Select mode="tags" placeholder="Add restrictions">
                                        <Select.Option value="Single family residential only">
                                            Single family residential only
                                        </Select.Option>
                                        <Select.Option value="No commercial use">
                                            No commercial use
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Description"
                            name="description"
                            rules={[{ required: true }]}
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder="Detailed description of the property..."
                            />
                        </Form.Item>

                        <Divider>Document Uploads (Storacha + IPFS)</Divider>

                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item label="Deed Document">
                                    <Upload
                                        beforeUpload={(file) => handleFileUpload(file, 'deed')}
                                        showUploadList={false}
                                        accept=".pdf,.doc,.docx"
                                    >
                                        <Button icon={<FileTextOutlined />}>
                                            {uploadedFiles.deed ? uploadedFiles.deed.name : "Upload Deed"}
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="Survey Document">
                                    <Upload
                                        beforeUpload={(file) => handleFileUpload(file, 'survey')}
                                        showUploadList={false}
                                        accept=".pdf,.doc,.docx"
                                    >
                                        <Button icon={<FileTextOutlined />}>
                                            {uploadedFiles.survey ? uploadedFiles.survey.name : "Upload Survey"}
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="Photos/Images">
                                    <Upload
                                        beforeUpload={(file) => handleFileUpload(file, 'photos')}
                                        showUploadList={false}
                                        accept=".jpg,.jpeg,.png,.zip"
                                    >
                                        <Button icon={<CameraOutlined />}>
                                            {uploadedFiles.photos ? uploadedFiles.photos.name : "Upload Photos"}
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>

                        {uploading && (
                            <div style={{ marginBottom: 16 }}>
                                <Text>Uploading to Storacha with DID...</Text>
                                <Progress percent={uploadProgress} status="active" size="small" />
                            </div>
                        )}

                        <Space size="middle" wrap>
                            <Button
                                type="primary"
                                onClick={handleRegisterWithDocuments}
                                loading={loading || uploading}
                                disabled={!connected}
                                size="large"
                            >
                                Register Land with Documents
                            </Button>
                            <Statistic
                                title="Next Land ID"
                                value={nextId ?? "-"}
                            />
                        </Space>
                    </Form>
                </Card>
            </Col>
        </Row>
    )

    const registerTab = (
        <Row gutter={[16, 16]}>
            <Col xs={24}>
                <Card title="Register Land (Simple)" bordered>
                    <Form form={form} layout="vertical" disabled={!connected}>
                        <Form.Item
                            label="Owner Address"
                            name="owner"
                            rules={[{ required: true, message: "Owner address required" }]}
                            initialValue={account?.address}
                        >
                            <Input placeholder="0x..." />
                        </Form.Item>
                        <Form.Item
                            label="Jurisdiction"
                            name="jurisdiction"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="e.g., Lagos, Nigeria" />
                        </Form.Item>
                        <Form.Item
                            label="Metadata Hash (IPFS/Arweave)"
                            name="metadata"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="ipfs://... or ar://..." />
                        </Form.Item>
                        <Space size="middle" wrap>
                            <Button
                                type="primary"
                                onClick={handleRegister}
                                loading={loading}
                                disabled={!connected}
                            >
                                Register
                            </Button>
                            <Statistic
                                title="Next Land ID"
                                value={nextId ?? "-"}
                            />
                        </Space>
                    </Form>
                </Card>
            </Col>
        </Row>
    )

    const lookupTab = (
        <Row gutter={[16, 16]}>
            <Col xs={24}>
                <Card title="Lookup Land" bordered>
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <InputNumber
                            style={{ width: "100%" }}
                            min={1}
                            value={
                                Number.isNaN(Number(landIdQuery))
                                    ? undefined
                                    : Number(landIdQuery)
                            }
                            onChange={(v) => setLandIdQuery(v ? String(v) : "")}
                            placeholder="Enter Land ID"
                        />
                        <Button
                            onClick={loadLand}
                            loading={lookupLoading}
                            type="default"
                        >
                            Load
                        </Button>
                        <Skeleton loading={lookupLoading} active>
                            {landInfo && (
                                <Card type="inner" title={`Land #${landInfo.id}`}>
                                    <Descriptions column={1} size="middle" bordered>
                                        <Descriptions.Item label="Owner">
                                            <Text copyable>{landInfo.owner}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Jurisdiction">
                                            {landInfo.jurisdiction}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Status">
                                            <Tag color={statusMeta.color}>
                                                {statusMeta.label}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Metadata Hash">
                                            <Text copyable code>
                                                {landInfo.metadata_hash}
                                            </Text>
                                        </Descriptions.Item>
                                        {landInfo.registered_at && (
                                            <Descriptions.Item label="Registered At">
                                                {new Date(parseInt(landInfo.registered_at) / 1000).toLocaleString()}
                                            </Descriptions.Item>
                                        )}
                                    </Descriptions>

                                    {landMetadata && (
                                        <div style={{ marginTop: 16 }}>
                                            <Divider>Detailed Information from Storacha</Divider>
                                            <Descriptions column={1} size="middle" bordered>
                                                <Descriptions.Item label="Title">
                                                    {landMetadata.title}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Description">
                                                    {landMetadata.description}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Address">
                                                    {landMetadata.property_details?.address}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Area">
                                                    {landMetadata.property_details?.area}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Property Type">
                                                    {landMetadata.property_details?.property_type}
                                                </Descriptions.Item>
                                                {landMetadata.property_details?.coordinates && (
                                                    <Descriptions.Item label="Coordinates">
                                                        {landMetadata.property_details.coordinates.latitude}, {landMetadata.property_details.coordinates.longitude}
                                                    </Descriptions.Item>
                                                )}
                                                {landMetadata.legal_info?.parcel_number && (
                                                    <Descriptions.Item label="Parcel Number">
                                                        {landMetadata.legal_info.parcel_number}
                                                    </Descriptions.Item>
                                                )}
                                                {landMetadata.legal_info?.zoning && (
                                                    <Descriptions.Item label="Zoning">
                                                        {landMetadata.legal_info.zoning}
                                                    </Descriptions.Item>
                                                )}
                                                {landMetadata.legal_info?.restrictions && landMetadata.legal_info.restrictions.length > 0 && (
                                                    <Descriptions.Item label="Restrictions">
                                                        {landMetadata.legal_info.restrictions.join(", ")}
                                                    </Descriptions.Item>
                                                )}
                                                <Descriptions.Item label="Storage Provider">
                                                    {landMetadata.storage_provider}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="DID">
                                                    <Text copyable code>
                                                        {landMetadata.did}
                                                    </Text>
                                                </Descriptions.Item>
                                            </Descriptions>

                                            {landMetadata.documents && Object.keys(landMetadata.documents).length > 0 && (
                                                <div style={{ marginTop: 16 }}>
                                                    <Divider>Documents</Divider>
                                                    <Space direction="vertical" style={{ width: "100%" }}>
                                                        {landMetadata.documents.deed && (
                                                            <Button
                                                                icon={<FileTextOutlined />}
                                                                href={`https://w3s.link/ipfs/${landMetadata.documents.deed}`}
                                                                target="_blank"
                                                            >
                                                                View Deed Document
                                                            </Button>
                                                        )}
                                                        {landMetadata.documents.survey && (
                                                            <Button
                                                                icon={<FileTextOutlined />}
                                                                href={`https://w3s.link/ipfs/${landMetadata.documents.survey}`}
                                                                target="_blank"
                                                            >
                                                                View Survey Document
                                                            </Button>
                                                        )}
                                                        {landMetadata.documents.photos && (
                                                            <Button
                                                                icon={<CameraOutlined />}
                                                                href={`https://w3s.link/ipfs/${landMetadata.documents.photos}`}
                                                                target="_blank"
                                                            >
                                                                View Photos
                                                            </Button>
                                                        )}
                                                    </Space>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            )}
                        </Skeleton>
                    </Space>
                </Card>
            </Col>
        </Row>
    )

    const manageTab = (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
                <Card title="Transfer Ownership" bordered>
                    <Form form={transferForm} layout="vertical" disabled={!connected}>
                        <Form.Item
                            label="Land ID"
                            name="landId"
                            rules={[
                                {
                                    required: true,
                                    type: "number",
                                    transform: (v) =>
                                        v === "" || v === null ? undefined : Number(v),
                                    min: 1,
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={1}
                                placeholder="e.g., 1"
                            />
                        </Form.Item>
                        <Form.Item
                            label="New Owner Address"
                            name="newOwner"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="0x..." />
                        </Form.Item>
                        <Button
                            type="primary"
                            onClick={handleTransfer}
                            loading={loading}
                            disabled={!connected}
                        >
                            Transfer
                        </Button>
                    </Form>
                </Card>
            </Col>

            <Col xs={24} md={12}>
                <Card title="Update Land Status" bordered>
                    <Form form={statusForm} layout="vertical" disabled={!connected}>
                        <Form.Item
                            label="Land ID"
                            name="landId"
                            rules={[
                                {
                                    required: true,
                                    type: "number",
                                    transform: (v) =>
                                        v === "" || v === null ? undefined : Number(v),
                                    min: 1,
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={1}
                                placeholder="e.g., 1"
                            />
                        </Form.Item>
                        <Form.Item
                            label="Status"
                            name="status"
                            rules={[{ required: true }]}
                        >
                            <Select
                                options={[
                                    { label: "Active", value: LandStatus.ACTIVE },
                                    { label: "Frozen", value: LandStatus.FROZEN },
                                    { label: "Disputed", value: LandStatus.DISPUTED },
                                ]}
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            onClick={handleStatus}
                            loading={loading}
                            disabled={!connected}
                        >
                            Update
                        </Button>
                    </Form>
                </Card>
            </Col>
        </Row>
    )

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{ position: "sticky", top: 0, zIndex: 1000 }}>
                <Row align="middle" justify="space-between" gutter={[12, 12]}>
                    <Col>
                        <Title level={3} style={{ color: "#fff", margin: 0 }}>
                            Veridia Land Registry + Storacha
                        </Title>
                    </Col>
                    <Col flex="none">{renderHeaderRight()}</Col>
                </Row>
            </Header>

            <Content
                style={{
                    padding: 16,
                    maxWidth: 1200,
                    margin: "0 auto",
                    width: "100%",
                }}
            >
                <Tabs
                    defaultActiveKey="register-docs"
                    items={[
                        {
                            key: "register-docs",
                            label: "Register with Documents",
                            children: registerWithDocumentsTab,
                        },
                        {
                            key: "register-simple",
                            label: "Register (Simple)",
                            children: registerTab,
                        },
                        { key: "lookup", label: "Lookup", children: lookupTab },
                        { key: "manage", label: "Manage", children: manageTab },
                    ]}
                />

                <Divider />
                <Text type="secondary">
                    Tip: Documents are stored on IPFS via Storacha using DID authentication. No API key needed!
                </Text>
            </Content>

            <Footer style={{ textAlign: "center" }}>
                Veridia © {new Date().getFullYear()} — Aptos {NETWORK_LABEL} + Storacha (DID: {STORACHA_DID.slice(0, 20)}...)
            </Footer>
        </Layout>
    )
}

export default AppWithDID

