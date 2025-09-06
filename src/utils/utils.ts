// src/utils/menuUtils.ts
import { MenuItem, SelectedOption, MenuItemOption } from "@/types";

export class MenuUtils {
  /**
   * คำนวณราคารวมของเมนูรวมตัวเลือก
   */
  static calculateTotalPrice(
    menuItem: MenuItem,
    selectedOptions: SelectedOption[],
    quantity: number = 1
  ): number {
    const basePrice = menuItem.price;
    const optionsPrice = selectedOptions.reduce(
      (sum, opt) => sum + opt.additionalPrice,
      0
    );
    return (basePrice + optionsPrice) * quantity;
  }

  /**
   * คำนวณราคาตัวเลือกที่เพิ่ม
   */
  static calculateOptionsPrice(selectedOptions: SelectedOption[]): number {
    return selectedOptions.reduce((sum, opt) => sum + opt.additionalPrice, 0);
  }

  /**
   * ตรวจสอบว่าเมนูมีตัวเลือกหรือไม่
   */
  static hasOptions(menuItem: MenuItem): boolean {
    return menuItem.menu_option && menuItem.menu_option.length > 0;
  }

  /**
   * ตรวจสอบว่าเมนูมีตัวเลือกที่บังคับเลือกหรือไม่
   */
  static hasRequiredOptions(menuItem: MenuItem): boolean {
    return (
      menuItem.menu_option?.some((option) => option.option?.isRequired) ?? false
    );
  }

  /**
   * สร้างข้อความอธิบายตัวเลือกที่เลือก
   */

  /**
   * ตรวจสอบว่าตัวเลือกที่เลือกตรงตามเงื่อนไขหรือไม่
   */
  static validateOptions(
    menuItem: MenuItem,
    selectedOptions: SelectedOption[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!menuItem.menu_option) {
      return { isValid: true, errors: [] };
    }

    for (const menuOption of menuItem.menu_option) {
      if (!menuOption.option) continue;

      const relatedOptions = selectedOptions.filter(
        (opt) => opt.optionId === menuOption.option?.id
      );

      // ตรวจสอบตัวเลือกที่บังคับเลือก
      if (menuOption.option.isRequired && relatedOptions.length === 0) {
        errors.push(`กรุณาเลือก ${menuOption.option.name}`);
      }

      // ตรวจสอบ single choice
      if (menuOption.option.type === "single" && relatedOptions.length > 1) {
        errors.push(`${menuOption.option.name} สามารถเลือกได้เพียง 1 ตัวเลือก`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * สร้าง unique key สำหรับ cart item ที่มี options
   */
  static generateCartItemKey(
    menuItemId: number,
    selectedOptions: SelectedOption[]
  ): string {
    const optionsKey = selectedOptions
      .sort((a, b) => a.optionId - b.optionId || a.valueId - b.valueId)
      .map((opt) => `${opt.optionId}:${opt.valueId}`)
      .join("|");

    return `${menuItemId}#${optionsKey}`;
  }

  /**
   * สร้างตัวเลือกเริ่มต้นสำหรับเมนู
   */

  /**
   * แปลงสถานะเป็นสีสำหรับแสดงผล
   */
  static getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      pending: "orange",
      preparing: "blue",
      ready: "green",
      served: "default",
      cancelled: "red",
    };
    return statusColors[status] || "default";
  }

  /**
   * แปลงสถานะเป็นข้อความภาษาไทย
   */
  static getStatusText(status: string): string {
    const statusTexts: Record<string, string> = {
      pending: "รอดำเนินการ",
      preparing: "กำลังเตรียม",
      ready: "พร้อมเสิร์ฟ",
      served: "เสิร์ฟแล้ว",
      cancelled: "ยกเลิก",
    };
    return statusTexts[status] || status;
  }
  static getDefaultOptions(menuItem: MenuItem): SelectedOption[] {
    if (!menuItem.menu_option) return [];

    const defaultOptions: SelectedOption[] = [];

    menuItem.menu_option.forEach((menuOption) => {
      if (menuOption.option?.isRequired) {
        const defaultValue =
          menuOption.option.optionValues.find((val) => val.isDefault) ||
          menuOption.option.optionValues[0]; // fallback เอาตัวแรก

        if (defaultValue) {
          defaultOptions.push({
            optionId: menuOption.option.id,
            valueId: defaultValue.id,
            additionalPrice: parseFloat(defaultValue.additionalPrice),
          });
        }
      }
    });

    return defaultOptions;
  }

  /**
   * สร้างข้อความอธิบายตัวเลือกที่เลือก (ปรับปรุงใหม่)
   */
  static getOptionsDescription(
    menuItem: MenuItem,
    selectedOptions: SelectedOption[]
  ): string {
    if (!selectedOptions.length || !menuItem.menu_option) return "";

    const descriptions: string[] = [];

    menuItem.menu_option.forEach((menuOption) => {
      if (!menuOption.option) return;

      const optionSelectedValues = selectedOptions
        .filter((opt) => opt.optionId === menuOption.option?.id)
        .map((opt) => {
          const value = menuOption.option?.optionValues.find(
            (v) => v.id === opt.valueId
          );
          if (!value) return "";

          let text = value.name;
          if (parseFloat(value.additionalPrice) > 0) {
            text += ` (+฿${parseFloat(
              value.additionalPrice
            ).toLocaleString()})`;
          }
          return text;
        })
        .filter(Boolean);

      if (optionSelectedValues.length > 0) {
        descriptions.push(
          `${menuOption.option.name}: ${optionSelectedValues.join(", ")}`
        );
      }
    });

    return descriptions.join(" | ");
  }

  /**
   * ตรวจสอบว่า cart item มี options เหมือนกันหรือไม่
   */
  static areOptionsEqual(
    options1: SelectedOption[],
    options2: SelectedOption[]
  ): boolean {
    if (options1.length !== options2.length) return false;

    const sorted1 = [...options1].sort(
      (a, b) => a.optionId - b.optionId || a.valueId - b.valueId
    );
    const sorted2 = [...options2].sort(
      (a, b) => a.optionId - b.optionId || a.valueId - b.valueId
    );

    return sorted1.every((opt1, index) => {
      const opt2 = sorted2[index];
      return opt1.optionId === opt2.optionId && opt1.valueId === opt2.valueId;
    });
  }
   static formatSelectedOptionsText(selectedOptions: SelectedOption[]): string {
    if (!selectedOptions.length) return '';
    
    // Group options by optionId
    const groupedOptions = selectedOptions.reduce((acc, opt) => {
      if (!acc[opt.optionId]) {
        acc[opt.optionId] = [];
      }
      acc[opt.optionId].push(opt);
      return acc;
    }, {} as Record<number, SelectedOption[]>);

    // สร้างข้อความสำหรับแต่ละ option group
    const optionTexts = Object.values(groupedOptions).map(options => {
      const optionNames = options.map(opt => {
        // ในความเป็นจริงควรมีการ map กับ option name จริง ๆ
        // แต่เนื่องจากเราไม่มี option metadata ใน cart
        // เราจะแสดงแค่ value info
        let text = `Value ID: ${opt.valueId}`;
        if (opt.additionalPrice > 0) {
          text += ` (+฿${opt.additionalPrice.toLocaleString()})`;
        }
        return text;
      });
      
      return optionNames.join(', ');
    });

    return optionTexts.join(' | ');
  }

  /**
   * สร้างข้อความอธิบายตัวเลือกแบบย่อ (สำหรับตะกร้า)
   */
  static formatSelectedOptionsSimple(selectedOptions: SelectedOption[]): {
    hasOptions: boolean;
    optionsCount: number;
    additionalPrice: number;
  } {
    const additionalPrice = this.calculateOptionsPrice(selectedOptions);
    
    return {
      hasOptions: selectedOptions.length > 0,
      optionsCount: selectedOptions.length,
      additionalPrice,
    };
  }
}

export const qrcodeLink = (text: string) => {
  return `${process.env.NEXT_PUBLIC_API_BASE_QR_URL}/customer/${text}/menu`;
}