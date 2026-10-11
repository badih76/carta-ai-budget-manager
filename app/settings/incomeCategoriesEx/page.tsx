'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { readStreamableValue } from "@ai-sdk/rsc";
import { generatePurposeCategoriesActionEx, getIncomeCategories, 
  saveIncomeCategories, saveMajorIncomeCategoriesV2 } from './actions';
import { Loader2, Table, Sparkles, Plus, } from 'lucide-react';
import { AIIncomeCategory, UAIIncomeCategory } from './categoriesListSchema';
import { Button } from '@/components/ui/button';
import HttpStatus from '@/lib/HttpStatus';
import { ToastError, ToastMessage } from '@/lib/sonnerUtils';
import { purposeOptions } from './types';
import CategoriesTable from './categoriesTable';
import ControlConfigPanel from './controlConfigPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubcategoryManualModal } from './SubcategoryManualModal';
import { SubcategoryAiDrawer } from './subcategoryAiDrawer';
import { returnSortedStreamedCategoriesList, sortIncomeCategories } from '@/lib/utils';
import SubCategoriesMatrixTable from './subCategoriesMatrixTable';
import { RouteChangeInterceptorModal, useUnsavedChangesModal } from '@/lib/routeInterceptorHandler';
import { fetchMajorCategories, fetchSubCategories } from './supportingFunctions';
import { useUser } from '@clerk/nextjs';

export default function CategoriesPage(): React.ReactElement {
  // Shared Purpose State
  const [selectedPurpose, setSelectedPurpose] = useState<string>('personal');
  const { user, isLoaded, isSignedIn } = useUser();

  // ==========================================
  // 1. MAJOR CATEGORIES STATES (UNTOUCHED)
  // ==========================================
  const [majorCategories, setMajorCategories] = useState<UAIIncomeCategory[]>([]);
  const [isMajorAiLoading, setIsMajorAiLoading] = useState<boolean>(false);
  const [isMajorSaving, setIsMajorSaving] = useState<boolean>(false);
  const [isMajorResetting, setIsMajorResetting] = useState<boolean>(false);

  // Major Categories Manual Creation
  const [majorCustomName, setMajorCustomName] = useState<string>('');
  const [majorCustomDesc, setMajorCustomDesc] = useState<string>('');
  const [majorCustomExamples, setMajorCustomExamples] = useState<string>('');
  const [majorAddNew, setMajorAddNew] = useState<'append' | 'replace'>('append');
  const [majorDepthMode, setMajorDepthMode] = useState<'general' | 'detailed'>('general');

  // Major Categories Inline Editing
  const [majorEditingIndex, setMajorEditingIndex] = useState<number | null>(null);
  const [majorEditName, setMajorEditName] = useState<string>('');
  const [majorEditDesc, setMajorEditDesc] = useState<string>('');
  const [majorEditExamples, setMajorEditExamples] = useState<string>('');


  // ==========================================
  // 2. SUB-CATEGORIES STATES (UPDATED FOR MATRIX)
  // ==========================================
  const [selectedMajorCategory, setSelectedMajorCategory] = useState<string>('');
  const [subCategories, setSubCategories] = useState<UAIIncomeCategory[]>([]);
  const [isSubSaving, setIsSubSaving] = useState<boolean>(false);
  const [isSubResetting, setIsSubResetting] = useState<boolean>(false);
  
  const [isDirty, setIsDirty] = useState(false);
  const { showModal, requestNavigation, handleConfirmLeave, handleCancelLeave } =
    useUnsavedChangesModal(isDirty);

  // Modal & Drawer State
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [drawerTargetMajor, setDrawerTargetMajor] = useState<string>('');

  const [ userId, setUserId ] = useState<string | null>(null);

  useEffect(() => {
    if(isLoaded && isSignedIn)
      setUserId(user.id);
  }, [ isLoaded ]);
  

  // ==========================================
  // INITIAL DATA FETCHING
  // ==========================================
  useEffect(() => {
    if(userId && userId != '') {
      fetchMajorCategories(userId!, selectedPurpose, selectedMajorCategory, setMajorCategories, setSelectedMajorCategory);
      fetchSubCategories(userId!, selectedPurpose, setSubCategories);
    }
  }, [ userId ]);

  const handlePurposeChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newPurpose = e.target.value;
    setSelectedPurpose(newPurpose);
    await fetchMajorCategories(userId!, selectedPurpose, selectedMajorCategory, setMajorCategories, setSelectedMajorCategory);
    await fetchSubCategories(userId!, selectedPurpose, setSubCategories);
  };

  // ==========================================
  // MAJOR CATEGORIES ACTIONS (UNTOUCHED)
  // ==========================================
  const handleGenerateMajor = async (): Promise<void> => {
    setIsMajorAiLoading(true);
    const response = await generatePurposeCategoriesActionEx(selectedPurpose, majorCategories);

    if (response.success && response.output) {
      try {
        for await (const partial of readStreamableValue(response.output)) {
          if (Array.isArray(partial)) {
            // 1. Strict filter: require name, description, and examples array
            const validatedList = (partial as any[])
              .filter(
                (item): item is UAIIncomeCategory =>
                  item &&
                  typeof item.name === 'string' &&
                  item.name.trim().length > 0 &&
                  typeof item.description === 'string' &&
                  item.description.trim().length > 0 &&
                  Array.isArray(item.examples) &&
                  item.examples.length > 0
              )
              .map((item) => ({ ...item, isSaved: false }));

            if (majorAddNew === 'append') {
              setMajorCategories((prev) =>
                returnSortedStreamedCategoriesList(prev, validatedList)
              );
            } else if (validatedList.length > 0) {
              setMajorCategories(validatedList);
            }
          }
        }

        // 2. Final Post-Stream Cleanup: Deduplicate and remove remaining partial names
        setMajorCategories((prev) => {
          return prev.filter((item, index, self) => {
            // Must have valid description
            if (!item.description || item.description.trim() === '') return false;

            // Remove truncated prefix duplicates (e.g., remove 'Education &' if 'Education & Development' exists)
            const isPrefixOfAnother = self.some(
              (other, otherIdx) =>
                otherIdx !== index &&
                other.name.startsWith(item.name) &&
                other.name.length > item.name.length
            );

            return !isPrefixOfAnother;
          });
        });

        setIsDirty(true);
        ToastMessage('Carta AI has finished adding suggested categories to your Major Categories list.');
      } catch (err) {
        console.error('Error parsing AI major categories:', err);
      }
    } else {
      alert(`AI Execution Error: ${response.error}`);
    }
    setIsMajorAiLoading(false);
  };

  const handleAddMajorCategory = (): void => {
    const nameTrimmed = majorCustomName.trim();
    if (!nameTrimmed) return;

    if (majorCategories.some(c => c.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      alert('A major category with this identifier already exists.');
      return;
    }

    const newCat: UAIIncomeCategory = {
      id: '',
      name: nameTrimmed,
      description: majorCustomDesc.trim() || 'Custom major category configuration.',
      examples: majorCustomExamples ? majorCustomExamples.split(',').map(ex => ex.trim()).filter(Boolean) : [],
      isSaved: false,
      level: 'major',
      parent: ''
    };

    setMajorCategories((prev) => [...prev, newCat]);
    setMajorCustomName('');
    setMajorCustomDesc('');
    setMajorCustomExamples('');

    setIsDirty(true);
  };

  const startEditingMajor = (index: number, currentItem: AIIncomeCategory): void => {
    setMajorEditingIndex(index);
    setMajorEditName(currentItem.name);
    setMajorEditDesc(currentItem.description);
    setMajorEditExamples(currentItem.examples.join(', '));
  };

  const saveMajorRowMutations = (indexToUpdate: number): void => {
    const nameTrimmed = majorEditName.trim();
    if (!nameTrimmed) return;

    setMajorCategories((prev) =>
      prev.map((cat, idx) =>
        idx === indexToUpdate
          ? {
              id: selectedMajorCategory,
              name: nameTrimmed,
              description: majorEditDesc.trim(),
              examples: majorEditExamples.split(',').map(ex => ex.trim()).filter(Boolean),
              isSaved: prev[indexToUpdate].isSaved,
              level: 'major',
              parent: ''
            }
          : cat
      )
    );
    setMajorEditingIndex(null);
  };

  const handleDeleteMajorCategory = (indexToRemove: number): void => {
    setMajorCategories((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (majorEditingIndex === indexToRemove) setMajorEditingIndex(null);
  };

  const resetMajorCategories = async () => {
    setIsMajorResetting(true);
    await fetchMajorCategories(userId!, selectedPurpose, selectedMajorCategory, setMajorCategories, setSelectedMajorCategory);
    ToastMessage('Major categories reset successfully');
    setIsMajorResetting(false);
  };

  const saveMajorCategories = async () => {
    setIsMajorSaving(true);

    try {
      const result = await saveMajorIncomeCategoriesV2(userId!, selectedPurpose, majorCategories);
      if (result.status !== HttpStatus.OK) throw new Error(result.error!);

      fetchMajorCategories(userId!, selectedPurpose, selectedMajorCategory, setMajorCategories, setSelectedMajorCategory);
      ToastMessage('Major categories saved successfully');
    } catch (error) {
      ToastError((error as Error).message);
    }
    setIsMajorSaving(false);
    setIsDirty(false);
  };

  // ==========================================
  // SUB-CATEGORIES ACTIONS (MATRIX & NAVIGATOR)
  // ==========================================
  const handleAddManualSubcategory = (newSub: UAIIncomeCategory) => {
    setSubCategories((prev) => [...prev, newSub]);
    ToastMessage(`Subcategory "${newSub.name}" added successfully`);
  };

  const handleAddBulkAiSubcategories = (newSubs: UAIIncomeCategory[]) => {
    setSubCategories((prev) => [...prev, ...newSubs]);
    ToastMessage(`Added ${newSubs.length} subcategories`);
  };

  const handleDeleteSubCategory = (subName: string, parentName: string): void => {
    setSubCategories((prev) =>
      prev.filter((cat) => !(cat.name === subName && cat.parent?.toLowerCase() === parentName.toLowerCase()))
    );
  };

  const resetSubCategories = async () => {
    setIsSubResetting(true);
    await fetchSubCategories(userId!, selectedPurpose, setSubCategories);
    ToastMessage('Sub-categories reset successfully');
    setIsSubResetting(false);
  };

  const saveSubCategories = async () => {
    setIsSubSaving(true);
    try {
      const result = await saveIncomeCategories(userId!, selectedPurpose, subCategories, 'sub');
      if (result.status !== HttpStatus.OK) throw new Error(result.error!);
      ToastMessage('Sub-categories saved successfully');
    } catch (error) {
      ToastError((error as Error).message);
    }
    setIsSubSaving(false);
    setIsDirty(false);
  };

  const openAiNavigator = (majorName?: string) => {
    setDrawerTargetMajor(majorName || (majorCategories[0]?.name ?? ''));
    setIsAiDrawerOpen(true);
  };

  return (
    <>
      <div className="space-y-5">
        <h1 className="text-3xl font-bold text-white dark:text-gray-100">
          Incomes Categories Architecture
        </h1>
        <p className="text-white dark:text-gray-400">
          Establish item taxonomy boundaries using contextual AI profiling models or build your custom metrics grid.
        </p>        
      </div>

      <Tabs defaultValue="majorCateg" className="w-full space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <TabsList className="bg-slate-900 border border-slate-800 w-full grid grid-cols-2 p-1">
          <TabsTrigger value="majorCateg" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-300 font-medium transition-all">
            Major Categories
          </TabsTrigger>
          <TabsTrigger value="subCategories" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-300 font-medium transition-all">
            Sub-Categories Matrix
          </TabsTrigger>
        </TabsList>

        {/* =========================================
            MAJOR CATEGORIES TAB CONTENT (UNTOUCHED)
           ========================================= */}
        <TabsContent value="majorCateg" className="space-y-4">
          <div className="flex flex-col gap-6 items-center w-full">
            <ControlConfigPanel 
              selectedPurpose={selectedPurpose} 
              handlePurposeChange={handlePurposeChange} 
              purposeOptions={purposeOptions} 
              depthMode={majorDepthMode} 
              setDepthMode={setMajorDepthMode} 
              addNewCategories={majorAddNew} 
              setAddNewCategories={setMajorAddNew} 
              handleGenerateFromPurpose={handleGenerateMajor} 
              isAiLoading={isMajorAiLoading} 
              customName={majorCustomName} 
              setCustomName={setMajorCustomName} 
              customDesc={majorCustomDesc} 
              setCustomDesc={setMajorCustomDesc} 
              customExamples={majorCustomExamples} 
              setCustomExamples={setMajorCustomExamples} 
              handleAddCustomCategory={handleAddMajorCategory} 
              categLevel='major'
              setIsDirty={setIsDirty}
            />

            <div className="lg:col-span-3 rounded-xl border border-slate-800 bg-slate-900/20 overflow-hidden w-full">
              <CategoriesTable 
                categories={majorCategories} 
                editingIndex={majorEditingIndex} 
                editName={majorEditName} 
                setEditName={setMajorEditName} 
                editDesc={majorEditDesc} 
                setEditDesc={setMajorEditDesc} 
                editExamples={majorEditExamples} 
                setEditExamples={setMajorEditExamples} 
                saveRowMutations={saveMajorRowMutations} 
                startEditing={startEditingMajor} 
                setEditingIndex={setMajorEditingIndex} 
                handleDeleteCategory={handleDeleteMajorCategory} 
                categLevel='major'
              />

              <div className='flex justify-end items-center gap-2 m-4'>
                <Button 
                  variant={'outline'} 
                  className='w-28'
                  onClick={resetMajorCategories} 
                  disabled={isMajorSaving || isMajorResetting}
                >
                  {isMajorResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset'
                  )}
                </Button>

                <Button 
                  variant={'default'} 
                  className='w-28 bg-emerald-600 hover:bg-emerald-500 text-white'
                  onClick={saveMajorCategories}
                  disabled={isMajorSaving || isMajorResetting}
                >
                  {isMajorSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* =========================================
            SUB-CATEGORIES TAB CONTENT (MATRIX + AI NAVIGATOR)
           ========================================= */}
        <TabsContent value="subCategories" className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Table className="w-5 h-5 text-indigo-400" />
                Category Structure Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Subcategories structured by parent major category. All parent labels are displayed in solid white.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsManualModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs gap-1.5"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                Add Subcategory
              </Button>

              <Button 
                onClick={() => openAiNavigator()}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5 shadow-lg shadow-purple-900/30"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                Open Gemini Navigator
              </Button>
            </div>
          </div>

          {/* Matrix Table */}
          <SubCategoriesMatrixTable 
            majorCategories={majorCategories} subCategories={subCategories} 
            openAiNavigator={openAiNavigator} handleDeleteSubCategory={handleDeleteSubCategory} 
            resetSubCategories={resetSubCategories} 
            isSubSaving={isSubSaving} isSubResetting={isSubResetting} saveSubCategories={saveSubCategories} 
          />
          
        </TabsContent>
      </Tabs>

      {/* Manual Creation Dialog */}
      <SubcategoryManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        majorCategories={majorCategories}
        selectedMajorCategory={selectedMajorCategory}
        onAddSubcategory={handleAddManualSubcategory}
      />

      {/* Gemini Navigator AI Drawer */}
      <SubcategoryAiDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        selectedPurpose={selectedPurpose}
        targetMajorCategory={drawerTargetMajor}
        subCategories={subCategories}
        majorCategories={majorCategories}
        onAddSubcategories={handleAddBulkAiSubcategories}
      />

      <RouteChangeInterceptorModal 
        showModal={showModal} 
        handleCancelLeave={handleCancelLeave} 
        handleConfirmLeave={handleConfirmLeave} />
    </>
  );
}