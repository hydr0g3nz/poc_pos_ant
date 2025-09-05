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
  Checkbox,
  Switch,
  Row,
  Col,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SettingOutlined,
  EyeOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { adminService } from "@/services/adminService";
import { menuOptionsService } from "@/services/menuOptionsService";
import {
  MenuItem,
  MenuItemOption,
  MenuOption,
  OptionValue,
  Category,
  OptionWithValues,
  AssignMenuItemOptionRequest,
  CreateMenuItemWithOptionsRequest,
  UpdateMenuItemWithOptionsRequest,
} from "@/types";
import { on } from "events";

const { Title } = Typography;
const { Search } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface MenuItemFormData {
  name: string;
  description?: string;
  price: number;
  category_id: number;
  kitchen_station_id: number;
  is_active?: boolean;
  is_recommended?: boolean;
  display_order?: number;
  options?: number[]; // Array of option IDs
}

export default function MenuManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  const { data: menuItems, isLoading } = useSWR("admin-menu-items", () =>
    adminService.getMenuItems(100, 0)
  );

  const { data: categories } = useSWR("admin-categories", () =>
    adminService.getCategories()
  );

  // เพิ่ม SWR สำหรับ options
  const { data: availableOptions } = useSWR(
    "admin-options",
    () => menuOptionsService.getOptionsWithValues() // สมมติว่ามี API นี้
  );
  const { data: kitchenStations } = useSWR("admin-kitchen-stations", () =>
    adminService.getKitchenStations()
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
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleEditItem = async (item: MenuItem) => {
    try {
      // โหลดรายละเอียดเมนูพร้อม options
      const response = await adminService.getMenuItem(item.id);
      const fullItem = response.data;

      setEditingItem(fullItem);
      setSelectedItem(fullItem);
      // ตั้งค่าฟอร์มพื้นฐาน
      form.setFieldsValue({
        name: fullItem.name,
        description: fullItem.description,
        price: fullItem.price,
        category_id: fullItem.category_id,
        kitchen_station_id: fullItem.kitchen_station_id, // ปรับตามข้อมูลจริง
        is_active: fullItem.is_active,
        is_recommended: fullItem.is_recommended,
        display_order: fullItem.display_order,
        options:
          fullItem.menu_option?.map((mo) => mo.option?.id).filter(Boolean) ||
          [],
      });

      setActiveTab("basic");
      setIsModalOpen(true);
    } catch (error) {
      message.error("ไม่สามารถโหลดรายละเอียดเมนูได้");
    }
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
      const values: MenuItemFormData = await form.validateFields();
      console.log("Form Values:", values);
      const menuData:
        | CreateMenuItemWithOptionsRequest
        | UpdateMenuItemWithOptionsRequest = {
        category_id: values.category_id,
        kitchen_station_id: values.kitchen_station_id,
        name: values.name,
        description: values.description,
        price: values.price,
        is_active: values.is_active ?? true,
        is_recommended: values.is_recommended ?? false,
        display_order: values.display_order ?? 0,
        assigned_options: [] as AssignMenuItemOptionRequest[],
      };
      // จัดการ menu options
      let menuOptions: AssignMenuItemOptionRequest[] = [];
      if (
        selectedItem?.menu_option &&
        selectedItem.menu_option.length > 0 &&
        values.options?.length === 0
      ) {
        // ถ้าไม่มีการเลือก options ใหม่เลย ให้ปิดการใช้งาน options เดิมทั้งหมด
        selectedItem.menu_option.forEach((mo) => {
          menuOptions.push({
            option_id: mo.option!.id,
            is_active: false,
          });
        });
      }
      if (values.options && values.options.length > 0) {
        selectedItem?.menu_option?.forEach((mo) => {
          if (!values.options?.includes(mo.option!.id)) {
            menuOptions.push({
              option_id: mo.option!.id,
              is_active: false,
            });
          }
        });

        values.options.forEach((optionId) => {
          if (
            !selectedItem?.menu_option?.some((mo) => mo.option?.id === optionId)
          ) {
            menuOptions.push({
              option_id: optionId,
              is_active: true,
            });
          }
        });
      }
      console.log("Menu Options to Assign:", menuOptions);
      console.log("options:", selectedItem?.menu_option);
      if (menuOptions.length > 0) {
        menuData.assigned_options = menuOptions;
      }
      console.log("Final Menu Data to Submit:", menuData.assigned_options);
      if (editingItem) {
        await menuOptionsService.updateMenuItemWithOptions(
          editingItem.id,
          menuData
        );
        message.success("แก้ไขเมนูสำเร็จ");
      } else {
        const response = await menuOptionsService.createMenuItemWithOptions(
          menuData
        );
        message.success("เพิ่มเมนูสำเร็จ");
      }

      setIsModalOpen(false);
      mutate("admin-menu-items");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกเมนู");
      console.error("Error details:", error);
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
            {menuOption.option?.name} ({menuOption.option?.type})
          </Tag>
        ))}
      </div>
    );
  };

  // Component สำหรับจัดการ Options ในฟอร์ม
  const OptionsSelector = () => (
    <div>
      <Form.Item
        name="options"
        label="ตัวเลือกเมนู"
        tooltip="เลือกตัวเลือกที่ต้องการให้ลูกค้าสามารถเลือกได้สำหรับเมนูนี้"
      >
        <Checkbox.Group className="w-full">
          <Row gutter={[16, 16]}>
            {availableOptions?.data?.map((option: OptionWithValues) => (
              <Col key={option.id} span={24}>
                <Card
                  size="small"
                  className="hover:shadow-md transition-shadow"
                >
                  <label className="w-full cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Checkbox value={option.id}>
                          <span className="font-medium">{option.name}</span>
                        </Checkbox>
                        <div className="mt-2 ml-6">
                          <Space>
                            <Tag
                              color={
                                option.type === "single" ? "blue" : "green"
                              }
                            >
                              {option.type === "single"
                                ? "เลือกได้ 1 ตัวเลือก"
                                : "เลือกได้หลายตัวเลือก"}
                            </Tag>
                            {option.is_required && (
                              <Tag color="red">บังคับเลือก</Tag>
                            )}
                          </Space>
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>ตัวเลือกย่อย:</strong>
                            <div className="mt-1">
                              {option.values?.map((value, idx) => (
                                <span
                                  key={value.id}
                                  className="inline-block mr-2 mb-1"
                                >
                                  {value.name}
                                  {parseFloat(value.additionalPrice) > 0 && (
                                    <span className="text-green-600 ml-1">
                                      (+฿
                                      {parseFloat(
                                        value.additionalPrice
                                      ).toLocaleString()}
                                      )
                                    </span>
                                  )}
                                  {value.isDefault && (
                                    <Tag color="gold" className="ml-1">
                                      ค่าเริ่มต้น
                                    </Tag>
                                  )}
                                  {idx < option.values.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                </Card>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Form.Item>

      {!availableOptions?.data?.length && (
        <div className="text-center py-8 text-gray-400">
          <p>ไม่มีตัวเลือกเมนู</p>
          <p className="text-sm">กรุณาสร้างตัวเลือกเมนูก่อน</p>
        </div>
      )}
    </div>
  );

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
      title: "สถานะ",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
        </Tag>
      ),
    },
    // {
    //   title: "ตัวเลือก",
    //   dataIndex: "menu_option",
    //   key: "menu_option",
    //   render: (menuOptions: MenuItemOption[]) =>
    //     renderOptionsPreview(menuOptions),
    //   width: 200,
    // },
    {
      title: "การดำเนินการ",
      key: "action",
      width: 280,
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
          {/* <Button
            size="small"
            icon={<SettingOutlined />}
            onClick={() => {
              // Navigate to options management
              window.location.href = `/admin/menu/${record.id}/options`;
            }}
          >
            จัดการตัวเลือก
          </Button> */}
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
        <Space>
          <Button
            icon={<SettingOutlined />}
            onClick={() => (window.location.href = "/admin/options")}
          >
            จัดการตัวเลือกเมนู
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddItem}
          >
            เพิ่มเมนูใหม่
          </Button>
        </Space>
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

      {/* Add/Edit Modal with Tabs */}
      <Modal
        title={editingItem ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false);
          setActiveTab("basic");
        }}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={800}
        destroyOnClose
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="ข้อมูลพื้นฐาน" key="basic">
            <Form form={form} layout="vertical" requiredMark={false}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="ชื่อเมนู"
                    rules={[{ required: true, message: "กรุณากรอกชื่อเมนู" }]}
                  >
                    <Input placeholder="กรอกชื่อเมนู" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="category_id"
                    label="หมวดหมู่"
                    rules={[{ required: true, message: "กรุณาเลือกหมวดหมู่" }]}
                  >
                    <Select
                      placeholder="เลือกหมวดหมู่"
                      options={categories?.data?.map((category: Category) => ({
                        label: category.name,
                        value: category.id,
                        disabled: !category.is_active,
                      }))}
                    >
                      {/* {categories?.data
                        ?.filter((category: any) => category.is_active)
                        .map((category: any) => (
                          <Select.Option
                            key={"category" + category.id}
                            value={category.id}
                          >
                            {category.name}
                          </Select.Option>
                        ))} */}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="kitchen_station_id"
                    label="สถานีครัว"
                    rules={[{ required: true, message: "กรุณาเลือกสถานีครัว" }]}
                  >
                    <Select
                      placeholder="เลือกสถานีครัว"
                      options={kitchenStations?.data?.map((station: any) => ({
                        label: station.name,
                        value: station.id,
                        disabled: !station.is_available,
                      }))}
                    >
                      {/* { kitchenStations?.data?.filter((station: any) => station.is_available).map((station) => (
                        <Select.Option key={"station" + station.id} value={station.id}>
                          {station.name}
                        </Select.Option>
                      ))} */}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
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
                      parser={(value) =>
                        value!.replace(/฿\s?|(,*)/g, "") as any
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="คำอธิบาย">
                <Input.TextArea placeholder="กรอกคำอธิบายเมนู" rows={3} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="is_active"
                    label="สถานะ"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="เปิดใช้งาน"
                      unCheckedChildren="ปิดใช้งาน"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="is_recommended"
                    label="แนะนำ"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="แนะนำ"
                      unCheckedChildren="ไม่แนะนำ"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="display_order" label="ลำดับการแสดง">
                    <InputNumber
                      placeholder="ลำดับ"
                      style={{ width: "100%" }}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>

          <TabPane
            tab={`ตัวเลือกเมนู ${
              editingItem?.menu_option?.length
                ? `(${editingItem.menu_option.length})`
                : ""
            }`}
            key="options"
          >
            <Form form={form} layout="vertical">
              <OptionsSelector />

              {/* แสดงตัวเลือกปัจจุบัน (สำหรับกรณีแก้ไข) */}
              {editingItem?.menu_option &&
                editingItem.menu_option.length > 0 && (
                  <div className="mt-6">
                    <Divider />
                    <Title level={5}>ตัวเลือกปัจจุบัน</Title>
                    <Collapse size="small">
                      {editingItem.menu_option.map((menuOption, index) => (
                        <Panel
                          key={index}
                          header={
                            <div className="flex justify-between items-center">
                              <span>{menuOption.option?.name}</span>
                              <Space>
                                <Tag
                                  color={
                                    menuOption.option?.type === "single"
                                      ? "blue"
                                      : "green"
                                  }
                                >
                                  {menuOption.option?.type === "single"
                                    ? "เลือกได้ 1 ตัวเลือก"
                                    : "เลือกได้หลายตัวเลือก"}
                                </Tag>
                                {menuOption.option?.isRequired && (
                                  <Tag color="red">บังคับเลือก</Tag>
                                )}
                                <Tag
                                  color={menuOption.is_active ? "green" : "red"}
                                >
                                  {menuOption.is_active
                                    ? "ใช้งาน"
                                    : "ปิดใช้งาน"}
                                </Tag>
                              </Space>
                            </div>
                          }
                        >
                          <List
                            size="small"
                            dataSource={menuOption.option?.optionValues || []}
                            renderItem={(value) => (
                              <List.Item className="flex justify-between">
                                <div className="flex items-center">
                                  <span>{value.name}</span>
                                  {value.isDefault && (
                                    <Tag color="gold" className="ml-2">
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
                  </div>
                )}
            </Form>
          </TabPane>
        </Tabs>
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
              <div>
                <strong>สถานะ:</strong>{" "}
                <Tag color={selectedItem.is_active ? "green" : "red"}>
                  {selectedItem.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </Tag>
              </div>
              <div>
                <strong>แนะนำ:</strong>{" "}
                <Tag color={selectedItem.is_recommended ? "gold" : "default"}>
                  {selectedItem.is_recommended ? "แนะนำ" : "ไม่แนะนำ"}
                </Tag>
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
                        <span>{menuOption.option?.name}</span>
                        <div>
                          <Tag
                            color={
                              menuOption.option?.type === "single"
                                ? "blue"
                                : "green"
                            }
                          >
                            {menuOption.option?.type === "single"
                              ? "เลือกได้ 1 ตัวเลือก"
                              : "เลือกได้หลายตัวเลือก"}
                          </Tag>
                          {menuOption.option?.isRequired && (
                            <Tag color="red">บังคับเลือก</Tag>
                          )}
                          <Tag color={menuOption.is_active ? "green" : "red"}>
                            {menuOption.is_active ? "ใช้งาน" : "ปิดใช้งาน"}
                          </Tag>
                        </div>
                      </div>
                    }
                    key={index}
                  >
                    <List
                      size="small"
                      dataSource={menuOption.option?.optionValues}
                      renderItem={(value) => (
                        <List.Item className="flex justify-between">
                          <div className="flex items-center">
                            <span>{value.name}</span>
                            {value.isDefault && (
                              <Tag color="gold" className="ml-2">
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
