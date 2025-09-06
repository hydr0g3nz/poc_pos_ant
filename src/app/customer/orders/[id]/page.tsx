"use client";

import {
  Card,
  Typography,
  Space,
  Button,
  List,
  Spin,
  Tag,
  Divider,
  Steps,
  message,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  BellOutlined,
  PhoneOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import useSWR from "swr";
import { customerService } from "@/services/customerService";
import moment from "moment";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { OrderItemDetailResponse } from "@/types";
const { Title, Paragraph, Text } = Typography;

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params?.id as string);
  const [callStaffModal, setCallStaffModal] = useState(false);

  const {
    data: orderDetail,
    isLoading,
    error,
  } = useSWR(orderId ? `order-detail-${orderId}` : null, () =>
    customerService.getOrderDetail(orderId)
  );

  const order = orderDetail?.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "processing";
      case "preparing":
        return "warning";
      case "ready":
        return "success";
      case "served":
        return "default";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "กำลังดำเนินการ";
      case "preparing":
        return "กำลังเตรียม";
      case "ready":
        return "พร้อมเสิร์ฟ";
      case "served":
        return "เสิร์ฟแล้ว";
      case "closed":
        return "เสร็จสิ้น";
      default:
        return status;
    }
  };
  const getItemStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "รอเตรียม";
      case "preparing":
        return "กำลังเตรียม";
      case "ready":
        return "พร้อมเสิร์ฟ";
      case "served":
        return "เสิร์ฟแล้ว";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };
  const getItemStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "processing";
      case "preparing":
        return "warning";
      case "ready":
        return "success";
      case "served":
        return "default";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };
  const getOrderProgress = (status: string) => {
    switch (status) {
      case "open":
        return 0;
      case "preparing":
        return 1;
      case "ready":
        return 2;
      case "served":
        return 3;
      case "closed":
        return 3;
      default:
        return 0;
    }
  };

  const handleCallStaff = () => {
    setCallStaffModal(true);
  };

  const confirmCallStaff = () => {
    message.success("เรียกพนักงานสำเร็จ! พนักงานจะมาที่โต๊ะของคุณเร็วๆ นี้");
    setCallStaffModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <Title level={4}>ไม่พบข้อมูลออเดอร์</Title>
          <Paragraph>ออเดอร์ที่คุณค้นหาไม่มีอยู่ในระบบ</Paragraph>
          <Button
            type="primary"
            onClick={() => router.push("/customer/orders")}
          >
            กลับไปหน้าออเดอร์
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Space className="mb-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/customer/menu")}
            >
              กลับ
            </Button>
          </Space>

          <div className="flex justify-between items-start">
            <div>
              <Title level={1} className="mb-2">
                ออเดอร์ #{order.id}
              </Title>
              <Space direction="vertical" size="small">
                <Space>
                  <Text type="secondary">โต๊ะ {order.table_number}</Text>
                  <Text type="secondary">•</Text>
                  <Text type="secondary">
                    {moment(order.created_at).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </Space>
              </Space>
            </div>

            <Tag
              color={getStatusColor(order.status)}
              className="text-lg px-4 py-2"
            >
              {getStatusText(order.status)}
            </Tag>
          </div>
        </div>

        {/* Order Progress */}
        {/* <Card className="mb-6">
          <Title level={4} className="mb-4">สถานะออเดอร์</Title>
          <Steps
            current={getOrderProgress(order.status)}
            items={[
              {
                title: 'รับออเดอร์',
                description: 'ระบบได้รับออเดอร์แล้ว',
                icon: <ClockCircleOutlined />,
              },
              {
                title: 'กำลังเตรียม',
                description: 'ครัวกำลังเตรียมอาหาร',
                icon: <LoadingOutlined />,
              },
              {
                title: 'พร้อมเสิร์ฟ',
                description: 'อาหารพร้อมเสิร์ฟแล้ว',
                icon: <CheckCircleOutlined />,
              },
              {
                title: 'เสร็จสิ้น',
                description: 'เสิร์ฟเสร็จเรียบร้อย',
                icon: <CheckCircleOutlined />,
              },
            ]}
          />
        </Card> */}

        {/* Order Items */}
        <Card className="mb-6">
          <Title level={4} className="mb-4">
            รายการอาหาร
          </Title>
          <List
            dataSource={
              order.items.sort((a, b) =>
                b.created_at.localeCompare(a.created_at)
              ) || []
            }
            renderItem={(item: OrderItemDetailResponse) => (
              <List.Item className="px-0">
                <div className="w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 flex justify-between">
                      <Text strong className="text-lg">
                        {item.menu_item?.name || item.name}
                      </Text>
                      {item.menu_item?.description && (
                        <Paragraph className="text-gray-600 text-sm mb-1">
                          {item.menu_item.description}
                        </Paragraph>
                      )}
                      {item.kitchen_station && (
                        <Tag color="blue">{item.kitchen_station}</Tag>
                      )}
                      {item.status && (
                        <Tag color={getItemStatusColor(item.status)} className="ml-2">
                          {getItemStatusText(item.status)}
                        </Tag>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        x{item.quantity}
                      </div>
                      <div className="text-orange-600 font-bold">
                        ฿{item.subtotal?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Options (ถ้ามี) */}
                  {item.options && item.options.length > 0 && (
                    <div className="pl-4 border-l-2 border-gray-200 mt-2">
                      <Text type="secondary" className="text-sm">
                        ตัวเลือก:
                      </Text>
                      {item.options.map((option: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            • {option.option?.name}: {option.value?.name}
                          </span>
                          {option.additional_price > 0 && (
                            <span className="text-orange-600">
                              +฿{option.additional_price}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* Order Summary */}
        <Card className="mb-6">
          <Title level={4} className="mb-4">
            สรุปออเดอร์
          </Title>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Text>จำนวนรายการ:</Text>
              <Text>{order.item_count} รายการ</Text>
            </div>

            <div className="flex justify-between">
              <Text>ยอดรวม:</Text>
              <Text>฿{order.subtotal?.toLocaleString()}</Text>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <Text>ส่วนลด:</Text>
                <Text>-฿{order.discount.toLocaleString()}</Text>
              </div>
            )}

            {order.service_charge > 0 && (
              <div className="flex justify-between">
                <Text>ค่าบริการ:</Text>
                <Text>฿{order.service_charge.toLocaleString()}</Text>
              </div>
            )}

            <Divider className="my-3" />

            <div className="flex justify-between text-lg font-bold">
              <Text strong>ยอดรวมทั้งสิ้น:</Text>
              <Text strong className="text-orange-600">
                ฿{order.total.toLocaleString()}
              </Text>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {order.status === "open" && (
            <Button
              type="primary"
              size="large"
              icon={<BellOutlined />}
              onClick={handleCallStaff}
              className="bg-green-600 hover:bg-green-700"
            >
              เรียกพนักงานเช็คบิล
            </Button>
          )}

          {/* <Button
            size="large"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            พิมพ์ใบเสร็จ
          </Button> */}
        </div>

        {/* Call Staff Modal */}
        <Modal
          title={
            <Space>
              <PhoneOutlined className="text-green-600" />
              เรียกพนักงาน
            </Space>
          }
          open={callStaffModal}
          onOk={confirmCallStaff}
          onCancel={() => setCallStaffModal(false)}
          okText="เรียกพนักงาน"
          cancelText="ยกเลิก"
          okButtonProps={{
            className: "bg-green-600 hover:bg-green-700",
          }}
        >
          <div className="py-4">
            <Paragraph>
              ต้องการเรียกพนักงานมาเช็คบิลสำหรับออเดอร์ #{order.id} หรือไม่?
            </Paragraph>
            <Paragraph type="secondary" className="text-sm">
              พนักงานจะได้รับการแจ้งเตือนและจะมาที่โต๊ะ {order.table_number}{" "}
              เร็วๆ นี้
            </Paragraph>
          </div>
        </Modal>
      </div>
    </div>
  );
}
