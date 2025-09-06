"use client";

import { Layout, Menu, Badge, Button, Drawer } from "antd";
import {
  MenuOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";

const { Header, Content } = Layout;

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const uuid = params?.uuid;

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm px-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-orange-500">Luna HDY</h1>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
          />
        </div>

        {/* Cart Icon */}
        <div className="hidden md:block">
          <Badge count={0} showZero={false}>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => router.push(`/customer/${uuid}/orders`)} // เปลี่ยนจาก /cart เป็น /orders
            >
              ตรวจสอบออเดอร์
            </Button>
          </Badge>
        </div>
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title="เมนู"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="md:hidden"
      ></Drawer>

      <Content className="bg-gray-50">{children}</Content>
    </Layout>
  );
}
