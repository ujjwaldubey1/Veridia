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
} from "antd"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design"
import {
    useLandRegistry,
    LandStatus,
    REGISTRY_ADDRESS,
} from "./useLandRegistry"

const { Header, Content, Footer } = Layout
const { Title, Text, Link } = Typography

function shortAddress(addr?: string, head = 6, tail = 4) {
    if (!addr) return "-"
    const s = addr.toString()
    if (s.length <= head + tail + 3) return s
    return `${s.slice(0, head)}...${s.slice(-tail)}`
}

// Determine network from Vite env; used to decide if we show deployment details
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

function App() {
    const { disconnect, account } = useWallet()
    const connected = !!account?.address

    const [form] = Form.useForm()
    const [transferForm] = Form.useForm()
    const [statusForm] = Form.useForm()

    const [loading, setLoading] = useState(false) // mutate tx loading
    const [lookupLoading, setLookupLoading] = useState(false) // read/view loading
    const [nextId, setNextId] = useState<number | null>(null)
    const [landIdQuery, setLandIdQuery] = useState<string>("1")
    const [landInfo, setLandInfo] = useState<any>(null)

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
                throw new Error(
                    "Please enter a valid Land ID (positive integer)"
                )
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
                throw new Error(
                    "Please enter a valid Land ID (positive integer)"
                )
            }
            const statusVal = Number(values.status)
            if (
                !Number.isInteger(statusVal) ||
                statusVal < 0 ||
                statusVal > 2
            ) {
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
                message.info("Land does not exist")
            } else {
                const info = await getLand(id)
                setLandInfo(info)
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
                await navigator.clipboard.writeText(
                    account?.address?.toString() || ""
                )
                message.success("Address copied")
            }
            if (key === "disconnect") {
                await disconnect()
            }
        } catch (e) {
            message.error("Action failed")
        }
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

    const registerTab = (
        <Row gutter={[16, 16]}>
            <Col xs={24}>
                <Card title="Register Land" bordered>
                    <Form form={form} layout="vertical" disabled={!connected}>
                        <Form.Item
                            label="Owner Address"
                            name="owner"
                            rules={[
                                {
                                    required: true,
                                    message: "Owner address required",
                                },
                            ]}
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
                                <Card
                                    type="inner"
                                    title={`Land #${landInfo.id}`}
                                >
                                    <Descriptions
                                        column={1}
                                        size="middle"
                                        bordered
                                    >
                                        <Descriptions.Item label="Owner">
                                            <Text copyable>
                                                {landInfo.owner}
                                            </Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Jurisdiction">
                                            {landInfo.jurisdiction}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Status">
                                            <Tag color={statusMeta.color}>
                                                {statusMeta.label}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Metadata">
                                            {typeof landInfo.metadata_hash ===
                                                "string" &&
                                            (landInfo.metadata_hash.startsWith(
                                                "ipfs://"
                                            ) ||
                                                landInfo.metadata_hash.startsWith(
                                                    "ar://"
                                                )) ? (
                                                <Link
                                                    href={
                                                        landInfo.metadata_hash
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {landInfo.metadata_hash}
                                                </Link>
                                            ) : (
                                                landInfo.metadata_hash
                                            )}
                                        </Descriptions.Item>
                                        {landInfo.registered_at && (
                                            <Descriptions.Item label="Registered At">
                                                {landInfo.registered_at}
                                            </Descriptions.Item>
                                        )}
                                    </Descriptions>
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
                    <Form
                        form={transferForm}
                        layout="vertical"
                        disabled={!connected}
                    >
                        <Form.Item
                            label="Land ID"
                            name="landId"
                            rules={[
                                {
                                    required: true,
                                    type: "number",
                                    transform: (v) =>
                                        v === "" || v === null
                                            ? undefined
                                            : Number(v),
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
                    <Form
                        form={statusForm}
                        layout="vertical"
                        disabled={!connected}
                    >
                        <Form.Item
                            label="Land ID"
                            name="landId"
                            rules={[
                                {
                                    required: true,
                                    type: "number",
                                    transform: (v) =>
                                        v === "" || v === null
                                            ? undefined
                                            : Number(v),
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
                                    {
                                        label: "Active",
                                        value: LandStatus.ACTIVE,
                                    },
                                    {
                                        label: "Frozen",
                                        value: LandStatus.FROZEN,
                                    },
                                    {
                                        label: "Disputed",
                                        value: LandStatus.DISPUTED,
                                    },
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
                            Veridia Land Registry
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
                    defaultActiveKey="register"
                    items={[
                        {
                            key: "register",
                            label: "Register",
                            children: registerTab,
                        },
                        { key: "lookup", label: "Lookup", children: lookupTab },
                        { key: "manage", label: "Manage", children: manageTab },
                    ]}
                />

                <Divider />
                <Text type="secondary">
                    Tip: registry owner can transfer any land in this demo. In
                    production, add authorization.
                </Text>
            </Content>

            <Footer style={{ textAlign: "center" }}>
                Veridia © {new Date().getFullYear()} — Aptos {NETWORK_LABEL}
            </Footer>
        </Layout>
    )
}

export default App
