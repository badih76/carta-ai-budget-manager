'use client';

import React, { createContext, useContext, useState } from 'react';
import { DBBudgetMakerSettings } from '@/src/drizzle/schema';
import { updateSetting as updateSettingsAction } from '@/app/settings/aiAvatarSettings/actions';
import { ToastError } from '@/lib/sonnerUtils';
import HttpStatus from '@/lib/HttpStatus';

interface SettingsContextType {
  settings: DBBudgetMakerSettings | null;
  updateSetting: <K extends keyof DBBudgetMakerSettings>(
    key: K,
    value: DBBudgetMakerSettings[K]
  ) => Promise<void>;
  isSaving: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({
  children,
  initialSettings,
  userId,
}: {
  children: React.ReactNode;
  initialSettings: DBBudgetMakerSettings | null;
  userId: string;
}) {
  const [settings, setSettings] = useState<DBBudgetMakerSettings | null>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const updateSetting = async <K extends keyof DBBudgetMakerSettings>(
    key: K,
    value: DBBudgetMakerSettings[K]
  ) => {
    if (!settings) {
      console.error('settings is null!');
      return;
    }

    // 1. Snapshot previous state for optimistic rollback
    const previousSettings = { ...settings };

    // 2. Optimistic local state update
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    // 3. Sync to DB using specific Row ID and User ID for tenant safety
    setIsSaving(true);
    try {
      console.log('Settings: ', settings);
      console.log('The ID is: ', settings.id);
      const result = await updateSettingsAction(settings.id, userId, { [key]: value});

      if (result.status !== HttpStatus.OK) {
        setSettings(previousSettings);
        ToastError(`Failed to save setting: ${result.error}`);
      }
    } catch (error) {
      setSettings(previousSettings);
      ToastError('Network error while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, isSaving }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};