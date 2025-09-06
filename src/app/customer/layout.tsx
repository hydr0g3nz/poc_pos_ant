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
import { useRouter, usePathname } from "next/navigation";
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

  const menuItems = [
    {
      key: "/customer",
      icon: <HomeOutlined />,
      label: "หน้าหลัก",
    },
    {
      key: "/customer/menu",
      icon: <MenuOutlined />,
      label: "เมนูอาหาร",
    },
    {
      key: "/customer/orders",
      icon: <UnorderedListOutlined />,
      label: "ออเดอร์ของฉัน",
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/")}
            className="mr-4"
          />
          <Link href="/customer" className="text-xl font-bold text-orange-600">
            ร้านอาหาร
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex">
          <Menu
            mode="horizontal"
            selectedKeys={[pathname]}
            items={menuItems.map((item) => ({
              ...item,
              onClick: () => router.push(item.key),
            }))}
            className="border-0 bg-transparent"
          />
        </div>

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
              onClick={() => router.push("/customer/orders")} // เปลี่ยนจาก /cart เป็น /orders
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
      >
        <Menu
          mode="vertical"
          selectedKeys={[pathname]}
          items={menuItems.map((item) => ({
            ...item,
            onClick: () => {
              router.push(item.key);
              setDrawerVisible(false);
            },
          }))}
          className="border-0"
        />
      </Drawer>

      <Content className="bg-gray-50">{children}</Content>
    </Layout>
  );
}
