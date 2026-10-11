'use client';

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Context & Custom Components
import { useSettings } from '@/src/context/settingsContext'; // Adjust import path as needed
import { ToastError, ToastMessage } from '@/lib/sonnerUtils';
import { AIAvatar } from '@/src/components/AiAvatar';
import { useUser } from '@clerk/nextjs';

export default function BudgetMakerSettingsPage(): React.ReactElement {
  const { settings, updateSetting, isSaving } = useSettings();

  const { isLoaded, isSignedIn, user } = useUser();

  // Local state for controlled text inputs to prevent network requests on every keystroke
  const [femaleName, setFemaleName] = useState('');
  const [maleName, setMaleName] = useState('');
  const [ userId, setUserId ] = useState<string | null>(null);

  // Sync local text inputs when context settings load or update externally
  useEffect(() => {
    if (settings) {
      setFemaleName(settings.cartaAiAvatarNameFemale || '');
      setMaleName(settings.cartaAiAvatarNameMale || '');
    }    
  }, [settings]);

  useEffect(() => {
    if(isLoaded && isSignedIn)
      setUserId(userId);
  }, [ isLoaded ]);

  useEffect(() => {
    console.log('Settings: ', settings);
  }, []);

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading settings...
      </div>
    );
  }

  const handleSaveTextNames = () => {
    if (!femaleName.trim() || !maleName.trim()) {
      ToastError('Avatar names for both male and female variants are required.');
      return;
    }
    updateSetting('cartaAiAvatarNameFemale', femaleName.trim());
    updateSetting('cartaAiAvatarNameMale', maleName.trim());
    ToastMessage('Avatar names updated!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveTextNames();
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-5">
          <h1 className="text-3xl font-bold text-white dark:text-gray-100">
            AI Avatar Settings
          </h1>
          <p className="text-white dark:text-gray-400">
            Configure global preferences, AI assistant personas, and workspace controls.
          </p>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="w-full rounded-xl border border-slate-800 bg-slate-700/40 p-6 backdrop-blur-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          
          {/* Section 1: AI Display Toggle */}
          <div className="space-y-4 pb-6 border-b border-slate-800 w-full">
            <div className="flex items-center gap-2 text-white font-medium text-base w-full">
              <span>Carta AI Assistant Visibility</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">                
                <FieldGroup className="w-full">
                  <FieldLabel htmlFor="switch-share">
                    <Field orientation="horizontal" className="bg-gray-400 rounded-md">
                      <FieldContent>
                        <FieldTitle className="text-lg text-white font-bold">Display Floating AI Avatar</FieldTitle>
                        <FieldDescription className="text-xs text-white italic">
                          Display or hide the Carta AI assistant avatar.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="switch-share" 
                        checked={settings.displayCartaAiAvatar === 1} 
                        onCheckedChange={(checked) => updateSetting('displayCartaAiAvatar', checked ? 1 : 0)} 
                      />
                    </Field>
                  </FieldLabel>                    
                </FieldGroup>
              </div>              
            </div>
          </div>

          {/* Section 2: Persona Customization */}
          <div className="space-y-4 grid-col-1 md:grid-cols-2">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Persona & Identity
            </h3>

            {/* <div className="space-y-2 grid grid-col-1 lg:grid-cols-2 gap-4 border-2 border-red-600">               */}
            <div className="w-full space-y-2 flex flex-row gap-4">              
              {/* Gender Radio Selector */}
              <RadioGroup
                value={settings.cartaAiAvatarGender}
                onValueChange={(val) => updateSetting('cartaAiAvatarGender', val)}
                className="w-full space-y-2 flex flex-col justify-between gap-2"
              >                    
                <div
                  onClick={() => updateSetting('cartaAiAvatarGender', 'male')}
                  className={`h-full rounded-md p-3 flex items-center justify-between cursor-pointer select-none transition-all ${
                    settings.cartaAiAvatarGender === 'male' ? 'bg-indigo-400 ring-2 ring-indigo-600' : 'bg-indigo-300'
                  }`}
                >
                  <FieldContent>
                    <div className='flex gap-4 justify-between'>
                        <FieldTitle className="text-white text-lg font-bold select-none w-[25%]">Male</FieldTitle>
                        <Input
                            id="maleName"
                            placeholder="e.g. Alex"
                            maxLength={10}
                            value={maleName}
                            onChange={(e) => setMaleName(e.target.value)}
                            onBlur={() => updateSetting('cartaAiAvatarNameMale', maleName.trim())}
                            className="bg-slate-950 border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 h-9 w-[75%]"
                        />
                    </div>
                  </FieldContent>
                  <RadioGroupItem value="male" id="gender-male" className='ml-4' />
                </div>

                <div
                  onClick={() => updateSetting('cartaAiAvatarGender', 'female')}
                  className={`h-full rounded-md p-3 flex items-center justify-between cursor-pointer select-none transition-all ${
                    settings.cartaAiAvatarGender === 'female' ? 'bg-pink-400 ring-2 ring-pink-600' : 'bg-pink-300'
                  }`}
                >
                  <FieldContent>
                    <div className='flex gap-4 justify-end'>
                        <FieldTitle className="text-white text-lg font-bold select-none w-[25%]">Female</FieldTitle>
                        <Input
                            id="femaleName"
                            placeholder="e.g. Sandra"
                            maxLength={10}
                            value={femaleName}
                            onChange={(e) => setFemaleName(e.target.value)}
                            onBlur={() => updateSetting('cartaAiAvatarNameFemale', femaleName.trim())}
                            className="bg-slate-950 border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 h-9 w-[75%]"
                        />
                    </div>
                  </FieldContent>
                  <RadioGroupItem value="female" id="gender-female" className='ml-4' />
                </div>
              </RadioGroup>                          
            </div>

            {/* Avatar Style Selector */}
            <div className="space-y-1.5 w-full">
              <Label htmlFor="avatarStyle" className="text-sm text-white mt-8">
                Avatar Visual Model
              </Label>
              <RadioGroup
                value={settings.cartaAiAvatarStyle.toString()}
                onValueChange={(val) => updateSetting('cartaAiAvatarStyle', parseInt(val, 10))}
                className="w-full space-y-2"
              >
                {/* Style 1 Card */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    updateSetting('cartaAiAvatarStyle', 1);
                  }}
                  className={`bg-indigo-300 rounded-md p-3 flex items-center justify-between cursor-pointer select-none transition-all ${
                    settings.cartaAiAvatarStyle === 1 ? 'ring-2 ring-indigo-600' : ''
                  }`}
                >
                  <FieldContent className="w-full">
                    <div className="flex justify-between items-center w-full pr-4">
                      <FieldTitle className="text-white text-lg font-bold select-none">
                        Cyber
                      </FieldTitle>
                      <div className="flex items-center gap-5 pointer-events-none">
                        <AIAvatar style={1} gender="male" />
                        <AIAvatar style={1} gender="female" />
                      </div>
                    </div>
                  </FieldContent>
                  <RadioGroupItem value="1" id="style-1" className='ml-6' />
                </div>

                {/* Style 2 Card */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    updateSetting('cartaAiAvatarStyle', 2);
                  }}
                  className={`bg-pink-300 rounded-md p-3 flex items-center justify-between cursor-pointer select-none transition-all ${
                    settings.cartaAiAvatarStyle === 2 ? 'ring-2 ring-pink-600' : ''
                  }`}
                >
                  <FieldContent className="w-full">
                    <div className="flex justify-between items-center w-full pr-4">
                      <FieldTitle className="text-white text-lg font-bold select-none">
                        Friendly
                      </FieldTitle>
                      <div className="flex items-center gap-5 pointer-events-none">
                        <AIAvatar style={2} gender="male" />
                        <AIAvatar style={2} gender="female" />
                      </div>
                    </div>
                  </FieldContent>
                  <RadioGroupItem value="2" id="style-2" className='ml-6' />
                </div>
              </RadioGroup>
            </div>        
          </div>          
        </form>
      </div>
    </div>
  );
}