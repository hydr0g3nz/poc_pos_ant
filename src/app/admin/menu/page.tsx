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
  Upload,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SettingOutlined,
  EyeOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  CameraOutlined,
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
import type { UploadFile, UploadProps } from "antd/es/upload/interface";

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
  image?: string; // Base64 image string
}

export default function MenuManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  
  // States for image handling
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const { data: menuItems, isLoading } = useSWR("admin-menu-items", () =>
    adminService.getMenuItems(100, 0)
  );

  const { data: categories } = useSWR("admin-categories", () =>
    adminService.getCategories()
  );

  const { data: availableOptions } = useSWR(
    "admin-options",
    () => menuOptionsService.getOptionsWithValues()
  );
  
  const { data: kitchenStations } = useSWR("admin-kitchen-stations", () =>
    adminService.getKitchenStations()
  );

  // Helper function to convert file to base64
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Handle preview
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  // Handle upload change
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList, file: uploadedFile }) => {

    console.log(newFileList.map(f => ({ name: f.name, status: f.status })));

    setFileList([...newFileList]);
  };

  // Custom upload request (prevent auto upload)
    const customRequest = ({ onSuccess }: { onSuccess: (body: string) => void; onError: (err: Error) => void; file: unknown; onProgress: (event: { percent: number }) => void }) => {
    console.log("Upload clicked!");
    onSuccess("ok");
  };

  // Validate file before upload
  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPng) {
      message.error('รองรับเฉพาะไฟล์ JPG, PNG และ WebP เท่านั้น!');
      console.log("return false");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('ขนาดไฟล์ต้องไม่เกิน 5MB!');
      console.log("return false");
      return false;
    }
    console.log("return true");
    return true;
  };

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
    setFileList([]);
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleEditItem = async (item: MenuItem) => {
    try {
      const response = await adminService.getMenuItem(item.id);
      const fullItem = response.data;

      setEditingItem(fullItem);
      setSelectedItem(fullItem);
      
      // Set form fields
      form.setFieldsValue({
        name: fullItem.name,
        description: fullItem.description,
        price: fullItem.price,
        category_id: fullItem.category_id,
        kitchen_station_id: fullItem.kitchen_station_id,
        is_active: fullItem.is_active,
        is_recommended: fullItem.is_recommended,
        display_order: fullItem.display_order,
        options:
          fullItem.menu_option?.map((mo) => mo.option?.id).filter(Boolean) ||
          [],
      });

      // Set existing image if available
      if (fullItem.image_url) {
        setFileList([
          {
            uid: '-1',
            name: 'รูปเมนูปัจจุบัน',
            status: 'done',
            url:`data:image/jpeg;base64,${fullItem.image_url}`, // Assuming this is the image URL from server
          },
        ]);
      } else {
        setFileList([]);
      }

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
      
      // Handle image conversion to base64
      let imageBase64 = "";
      if (fileList.length > 0) {
        const file = fileList[0];
        if (file.originFileObj) {
          // New image uploaded
          imageBase64 = await getBase64(file.originFileObj as File);
        } else if (file.url && !file.url.startsWith('data:')) {
          // Keep existing image (if it's a URL, you might want to handle this differently)
          imageBase64 = file.url;
        }
      }

      const menuData: CreateMenuItemWithOptionsRequest | UpdateMenuItemWithOptionsRequest = {
        category_id: values.category_id,
        kitchen_station_id: values.kitchen_station_id,
        name: values.name,
        description: values.description,
        price: values.price,
        is_active: values.is_active ?? true,
        is_recommended: values.is_recommended ?? false,
        display_order: values.display_order ?? 0,
        assigned_options: [] as AssignMenuItemOptionRequest[],
        image_urls: imageBase64, // Add image to the data
      };

      // Handle menu options (existing logic)
      const menuOptions: AssignMenuItemOptionRequest[] = [];
      if (
        selectedItem?.menu_option &&
        selectedItem.menu_option.length > 0 &&
        values.options?.length === 0
      ) {
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

      if (menuOptions.length > 0) {
        menuData.assigned_options = menuOptions;
      }

      if (editingItem) {
        await menuOptionsService.updateMenuItemWithOptions(
          editingItem.id,
          menuData
        );
        message.success("แก้ไขเมนูสำเร็จ");
      } else {
        await menuOptionsService.createMenuItemWithOptions(menuData);
        message.success("เพิ่มเมนูสำเร็จ");
      }

      setIsModalOpen(false);
      setFileList([]);
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

  // Image Upload Component
  const ImageUpload = () => (
    <Form.Item
      name="image"
      label="รูปภาพเมนู"
      tooltip="รองรับไฟล์ JPG, PNG, WebP ขนาดไม่เกิน 5MB"
    >
      <div>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleUploadChange}
          customRequest={() => {console.log('custom request')}}
          beforeUpload={beforeUpload}
          // maxCount={1}
          accept="image/*"
        >
          <div>
              <CameraOutlined />
              <div style={{ marginTop: 8 }}>เลือกรูปภาพ</div>
            </div>
          {/* {fileList.length === 0 && (
            <div>
              <CameraOutlined />
              <div style={{ marginTop: 8 }}>เลือกรูปภาพ</div>
            </div>
          )} */}
        </Upload>
        
        {/* Preview Modal */}
        <Modal
          open={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img alt="preview" style={{ width: '100%' }} src={previewImage} />
        </Modal>
        
        <div className="text-xs text-gray-500 mt-2">
          • รองรับไฟล์: JPG, PNG, WebP
          <br />
          • ขนาดไฟล์: ไม่เกิน 5MB
          <br />
          • ขนาดที่แนะนำ: 400x400 พิกเซล
        </div>
      </div>
    </Form.Item>
  );

  // Component สำหรับจัดการ Options ในฟอร์ม (existing code remains the same)
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
      title: "รูปภาพ",
      dataIndex: "image_url",
      key: "image",
      width: 80,
      render: (image: string, record: MenuItem) => (
        image ? (
          <Image
            width={50}
            height={50}
            src={`data:image/jpeg;base64,${image}`}
            alt={record.name}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN4BMghCWb3gvsCEAGgtBabqVwBkhGUeAKoVQNTgFJYzRVeEKTCqKTSU+pO4l3kJ2cAb5gSDQMV7K/AZJbOjL5apmZnur3eQ4woXv6/32W/w"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
            <CameraOutlined className="text-gray-400" />
          </div>
        )
      ),
    },
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
          setFileList([]);
        }}
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={800}
        destroyOnClose
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="ข้อมูลพื้นฐาน" key="basic">
            <Form form={form} layout="vertical" requiredMark={false}>
              {/* Image Upload Section */}
              <Row gutter={16}>
                <Col span={24}>
                  <ImageUpload />
                </Col>
              </Row>

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
                    />
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
                    />
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
            {/* แสดงรูปภาพในส่วน detail */}
            {selectedItem.image_urls && (
              <div className="mb-6 text-center">
                <Image
                  width={200}
                  height={200}
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                />
              </div>
            )}

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