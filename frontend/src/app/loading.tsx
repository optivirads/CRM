'use client';

import React from 'react';
import { LogoLoader } from '@/components/common/LogoLoader';

export default function Loading() {
  return (
    <LogoLoader
      fullScreen
      text="OptiVir CRM"
      subtext="Loading system resources..."
    />
  );
}
