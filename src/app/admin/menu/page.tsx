// src/app/admin/menu/page.tsx

"use client";

import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  message,
  Popconfirm,
  Tag,
  Collapse,
  List,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SettingOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { adminService } from "@/services/adminService";
import { MenuItem, MenuItemOption } from "@/types";

const { Title } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

export default function MenuManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const { data: menuItems, isLoading } = useSWR("admin-menu-items", () =>
    adminService.getMenuItems(100, 0)
  );

  const { data: categories } = useSWR("admin-categories", () =>
    adminService.getCategories()
  );

  const handleViewDetail = async (id: number) => {
    try {
      const response = await adminService.getMenuItem(id);
      setSelectedItem(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      message.error("ไม่สามารถโหลดรายละเอียดเมนูได้");
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: item.category_id,
      kitchen_station_id: 1,
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await adminService.deleteMenuItem(id);
      message.success("ลบเมนูสำเร็จ");
      mutate("admin-menu-items");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการลบเมนู");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingItem) {
        await adminService.updateMenuItem(editingItem.id, values);
        message.success("แก้ไขเมนูสำเร็จ");
      } else {
        await adminService.createMenuItem(values);
        message.success("เพิ่มเมนูสำเร็จ");
      }

      setIsModalOpen(false);
      mutate("admin-menu-items");
    } catch (error) {
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const renderOptionsPreview = (menuOptions: MenuItemOption[]) => {
    if (!menuOptions || menuOptions.length === 0) {
      return <span className="text-gray-400">ไม่มีตัวเลือก</span>;
    }

    return (
      <div>
        {menuOptions.map((menuOption, index) => (
          <Tag key={index} color="blue" className="mb-1">
            {menuOption.option.name} ({menuOption.option.type})
          </Tag>
        ))}
      </div>
    );
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "ชื่อเมนู",
      dataIndex: "name",
      key: "name",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: MenuItem) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "หมวดหมู่",
      dataIndex: "category",
      key: "category",
      render: (category: string) => (
        <Tag color="blue">{category || "ไม่ระบุ"}</Tag>
      ),
    },
    {
      title: "ราคา",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `฿${price?.toLocaleString()}`,
      sorter: (a: MenuItem, b: MenuItem) => a.price - b.price,
    },
    {
      title: "ตัวเลือก",
      dataIndex: "menu_option",
      key: "menu_option",
      render: (menuOptions: MenuItemOption[]) =>
        renderOptionsPreview(menuOptions),
      width: 200,
    },
    {
      title: "การดำเนินการ",
      key: "action",
      width: 250,
      render: (_: any, record: MenuItem) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            ดู
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
          >
            แก้ไข
          </Button>
          <Button
            size="small"
            icon={<SettingOutlined />}
            onClick={() => {
              // Navigate to options management
              window.location.href = `/admin/menu/${record.id}/options`;
            }}
          >
            จัดการตัวเลือก
          </Button>
          <Popconfirm
            title="ต้องการลบเมนูนี้?"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>จัดการเมนู</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
          เพิ่มเมนูใหม่
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Search
            placeholder="ค้นหาเมนู..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={menuItems?.data?.items || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: menuItems?.data?.total || 0,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingItem ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={600}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="ชื่อเมนู"
            rules={[{ required: true, message: "กรุณากรอกชื่อเมนู" }]}
          >
            <Input placeholder="กรอกชื่อเมนู" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="หมวดหมู่"
            rules={[{ required: true, message: "กรุณาเลือกหมวดหมู่" }]}
          >
            <Select placeholder="เลือกหมวดหมู่">
              {categories?.data?.map((category: any) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="kitchen_station_id"
            label="สถานีครัว"
            rules={[{ required: true, message: "กรุณาเลือกสถานีครัว" }]}
          >
            <Select placeholder="เลือกสถานีครัว">
              <Select.Option value={1}>สถานีหลัก</Select.Option>
              <Select.Option value={2}>สถานีเครื่องดื่ม</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="ราคา"
            rules={[
              { required: true, message: "กรุณากรอกราคา" },
              {
                type: "number",
                min: 0,
                message: "ราคาต้องมากกว่าหรือเท่ากับ 0",
              },
            ]}
          >
            <InputNumber
              placeholder="กรอกราคา"
              style={{ width: "100%" }}
              min={0}
              step={0.01}
              formatter={(value) =>
                `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/฿\s?|(,*)/g, "") as any}
            />
          </Form.Item>

          <Form.Item name="description" label="คำอธิบาย">
            <Input.TextArea placeholder="กรอกคำอธิบายเมนู" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`รายละเอียดเมนู: ${selectedItem?.name}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            ปิด
          </Button>,
        ]}
        width={800}
      >
        {selectedItem && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <strong>ชื่อเมนู:</strong> {selectedItem.name}
              </div>
              <div>
                <strong>ราคา:</strong> ฿{selectedItem.price?.toLocaleString()}
              </div>
              <div>
                <strong>หมวดหมู่:</strong> {selectedItem.category}
              </div>
              <div>
                <strong>สถานีครัว:</strong> {selectedItem.kitchen_station}
              </div>
            </div>

            {selectedItem.description && (
              <div className="mb-4">
                <strong>คำอธิบาย:</strong> {selectedItem.description}
              </div>
            )}

            <Divider />

            <Title level={4}>ตัวเลือกเมนู</Title>
            {selectedItem.menu_option && selectedItem.menu_option.length > 0 ? (
              <Collapse>
                {selectedItem.menu_option?.map((menuOption, index) => (
                  <Panel
                    header={
                      <div className="flex justify-between">
                        <span>{menuOption.option.name}</span>
                        <div>
                          <Tag
                            color={
                              menuOption.option.type === "single"
                                ? "blue"
                                : "green"
                            }
                          >
                            {menuOption.option.type === "single"
                              ? "เลือกได้ 1 ตัวเลือก"
                              : "เลือกได้หลายตัวเลือก"}
                          </Tag>
                          {menuOption.option.isRequired && (
                            <Tag color="red">บังคับเลือก</Tag>
                          )}
                        </div>
                      </div>
                    }
                    key={index}
                  >
                    <List
                      size="small"
                      dataSource={menuOption.option.optionValues}
                      renderItem={(value) => (
                        <List.Item className="flex justify-between">
                          <div className="flex items-center">
                            <span>{value.name}</span>
                            {value.isDefault && (
                              <Tag color="gold" size="small" className="ml-2">
                                ค่าเริ่มต้น
                              </Tag>
                            )}
                          </div>
                          <div>
                            {parseFloat(value.additionalPrice) > 0 ? (
                              <span className="text-green-600">
                                +฿
                                {parseFloat(
                                  value.additionalPrice
                                ).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-gray-400">ฟรี</span>
                            )}
                          </div>
                        </List.Item>
                      )}
                    />
                  </Panel>
                ))}
              </Collapse>
            ) : (
              <div className="text-center py-8 text-gray-400">
                ไม่มีตัวเลือกสำหรับเมนูนี้
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
