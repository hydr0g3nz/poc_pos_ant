import { Spin } from 'antd';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
}

export default function LoadingSpinner({ size = 'default', tip }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center py-8">
      <Spin size={size} tip={tip} />
    </div>
  );
}