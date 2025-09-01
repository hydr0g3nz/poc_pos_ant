// src/hooks/useMenuOptions.ts
import { useState, useCallback } from 'react';
import { MenuItem, SelectedOption, MenuItemOption } from '@/types';

export const useMenuOptions = () => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  const handleOptionChange = useCallback((
    optionId: number,
    valueId: number,
    additionalPrice: string,
    isRequired: boolean,
    type: 'single' | 'multiple'
  ) => {
    const price = parseFloat(additionalPrice);

    setSelectedOptions(prev => {
      if (type === 'single') {
        // ลบตัวเลือกเดิมของ option นี้ออกก่อน
        const newOptions = prev.filter(opt => opt.optionId !== optionId);
        return [...newOptions, { optionId, valueId, additionalPrice: price }];
      } else {
        // สำหรับ multiple choice
        const existingIndex = prev.findIndex(
          opt => opt.optionId === optionId && opt.valueId === valueId
        );

        if (existingIndex >= 0) {
          // ลบถ้ามีอยู่แล้ว
          return prev.filter((_, index) => index !== existingIndex);
        } else {
          // เพิ่มใหม่
          return [...prev, { optionId, valueId, additionalPrice: price }];
        }
      }
    });
  }, []);

  const resetOptions = useCallback((menuItem?: MenuItem) => {
    if (!menuItem?.menu_option) {
      setSelectedOptions([]);
      return;
    }

    // ตั้งค่าตัวเลือกเริ่มต้น (สำหรับ required options ที่มี default value)
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
    setSelectedOptions(defaultOptions);
  }, []);

  const validateRequiredOptions = useCallback((menuItem?: MenuItem): boolean => {
    if (!menuItem?.menu_option) return true;

    for (const menuOption of menuItem.menu_option) {
      if (menuOption.option?.isRequired) {
        const hasSelection = selectedOptions.some(
          opt => opt.optionId === menuOption.option?.id
        );
        if (!hasSelection) return false;
      }
    }
    return true;
  }, [selectedOptions]);

  const getSelectedOptionsText = useCallback((menuItem?: MenuItem): string => {
    if (!selectedOptions.length || !menuItem?.menu_option) return '';
    
    const optionTexts: string[] = [];
    menuItem.menu_option.forEach(menuOption => {
      if (!menuOption.option) return;
      
      const optionSelectedValues = selectedOptions
        .filter(opt => opt.optionId === menuOption.option?.id)
        .map(opt => {
          const value = menuOption.option?.optionValues.find(v => v.id === opt.valueId);
          return value?.name;
        })
        .filter(Boolean);
      
      if (optionSelectedValues.length > 0) {
        optionTexts.push(`${menuOption.option.name}: ${optionSelectedValues.join(', ')}`);
      }
    });
    
    return optionTexts.join(' | ');
  }, [selectedOptions]);

  return {
    selectedOptions,
    setSelectedOptions,
    handleOptionChange,
    resetOptions,
    validateRequiredOptions,
    getSelectedOptionsText,
  };
};