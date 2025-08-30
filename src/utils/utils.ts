// src/utils/menuUtils.ts
import { MenuItem, SelectedOption, MenuItemOption } from '@/types';

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
    return menuItem.menu_option?.some(
      option => option.option?.isRequired
    ) ?? false;
  }

  /**
   * สร้างข้อความอธิบายตัวเลือกที่เลือก
   */
  static getOptionsDescription(
    menuItem: MenuItem,
    selectedOptions: SelectedOption[]
  ): string {
    if (!selectedOptions.length || !menuItem.menu_option) return '';
    
    const descriptions: string[] = [];
    
    menuItem.menu_option.forEach(menuOption => {
      if (!menuOption.option) return;
      
      const optionSelectedValues = selectedOptions
        .filter(opt => opt.optionId === menuOption.option?.id)
        .map(opt => {
          const value = menuOption.option?.optionValues.find(v => v.id === opt.valueId);
          let text = value?.name || '';
          if (parseFloat(value?.additionalPrice || '0') > 0) {
            text += ` (+฿${parseFloat(value?.additionalPrice || '0').toLocaleString()})`;
          }
          return text;
        })
        .filter(Boolean);
      
      if (optionSelectedValues.length > 0) {
        descriptions.push(`${menuOption.option.name}: ${optionSelectedValues.join(', ')}`);
      }
    });
    
    return descriptions.join(' | ');
  }

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
        opt => opt.optionId === menuOption.option?.id
      );

      // ตรวจสอบตัวเลือกที่บังคับเลือก
      if (menuOption.option.isRequired && relatedOptions.length === 0) {
        errors.push(`กรุณาเลือก ${menuOption.option.name}`);
      }

      // ตรวจสอบ single choice
      if (menuOption.option.type === 'single' && relatedOptions.length > 1) {
        errors.push(`${menuOption.option.name} สามารถเลือกได้เพียง 1 ตัวเลือก`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * สร้าง unique key สำหรับ cart item ที่มี options
   */
  static generateCartItemKey(menuItemId: number, selectedOptions: SelectedOption[]): string {
    const optionsKey = selectedOptions
      .sort((a, b) => a.optionId - b.optionId || a.valueId - b.valueId)
      .map(opt => `${opt.optionId}:${opt.valueId}`)
      .join('|');
    
    return `${menuItemId}#${optionsKey}`;
  }

  /**
   * สร้างตัวเลือกเริ่มต้นสำหรับเมนู
   */
  static getDefaultOptions(menuItem: MenuItem): SelectedOption[] {
    if (!menuItem.menu_option) return [];
    
    const defaultOptions: SelectedOption[] = [];
    
    menuItem.menu_option.forEach((menuOption) => {
      if (menuOption.option?.isRequired) {
        const defaultValue = menuOption.option.optionValues.find(val => val.isDefault);
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
   * แปลงสถานะเป็นสีสำหรับแสดงผล
   */
  static getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'pending': 'orange',
      'preparing': 'blue',
      'ready': 'green',
      'served': 'default',
      'cancelled': 'red',
    };
    return statusColors[status] || 'default';
  }

  /**
   * แปลงสถานะเป็นข้อความภาษาไทย
   */
  static getStatusText(status: string): string {
    const statusTexts: Record<string, string> = {
      'pending': 'รอดำเนินการ',
      'preparing': 'กำลังเตรียม',
      'ready': 'พร้อมเสิร์ฟ',
      'served': 'เสิร์ฟแล้ว',
      'cancelled': 'ยกเลิก',
    };
    return statusTexts[status] || status;
  }
}