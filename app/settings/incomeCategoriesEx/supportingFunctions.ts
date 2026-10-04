import { sortIncomeCategories } from "@/lib/utils";
import { getIncomeCategories } from "./actions";
import { UAIIncomeCategory } from "./categoriesListSchema";

export const fetchMajorCategories = async (
    userId: string,
    purpose: string, 
    selectedMajorCategory: string,
    setMajorCategories: React.Dispatch<React.SetStateAction<UAIIncomeCategory[]>>,
    setSelectedMajorCategory: React.Dispatch<React.SetStateAction<string>>
  ) => {
    try {
      const results = await getIncomeCategories(userId, purpose, 'major');
      if (results.data && results.data.length > 0) {
        const fetched = results
          .data
          .filter((c: any) => c.level === 'major')
          .map((c: any) => ({
              id: c.id,
              name: c.name,
              description: c.description,
              examples: typeof c.examples === 'string' ? JSON.parse(c.examples || '[]') : (c.examples || []),
              isSaved: true,
              level: 'major'
            }
          ));

        const sortedFetched = sortIncomeCategories(fetched, 'asc');

        setMajorCategories(sortedFetched);
        if (fetched.length > 0 && !selectedMajorCategory) {
          setSelectedMajorCategory(fetched[0].name);
        }
      } else {
        setMajorCategories([]);
      }
    } catch (error) {
      console.error('Error fetching major categories:', (error as Error).message);
    }
  };
  
  export const fetchSubCategories = async (
    userId: string,
    purpose: string,
    setSubCategories: React.Dispatch<React.SetStateAction<UAIIncomeCategory[]>>
) => {
    try {
      const results = await getIncomeCategories(userId, purpose, 'sub');

      if (results.data && results.data.length > 0) {
        const fetched = results
          .data
          .filter((c: any) => c.level === 'sub')
          .map((c: any) => ({
            name: c.name,
            description: c.description,
            examples: typeof c.examples === 'string' ? JSON.parse(c.examples || '[]') : (c.examples || []),
            isSaved: true,
            level: 'sub',
            parent: c.parent || ''
          }));

        const sortedFetched = sortIncomeCategories(fetched, 'asc');

        setSubCategories(sortedFetched);
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.error('Error fetching sub-categories:', (error as Error).message);
    }
  };
