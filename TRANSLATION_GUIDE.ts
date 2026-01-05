// Translation Integration Guide
// This file contains instructions for integrating translations into remaining components

/*
REMAINING COMPONENTS TO UPDATE:
1. Login.tsx
2. Home.tsx
3. Fridge.tsx
4. ShoppingList.tsx
5. MealPlanner.tsx
6. SuggestionView.tsx
7. All modal components (AddItemModal, EditFridgeItemModal, etc.)

STEPS FOR EACH COMPONENT:

1. Import useTranslation:
   import { useTranslation } from 'react-i18next';

2. Add hook at the top of the component:
   const { t } = useTranslation();

3. Replace hardcoded text with translation keys:
   - Vietnamese text: 'Đăng nhập' → {t('auth.login')}
   - Alerts: Alert.alert('Lỗi', 'Message') → Alert.alert(t('common.error'), t('...'))
   - Button text: 'Lưu' → {t('common.save')}
   - Placeholders: placeholder="Email" → placeholder={t('auth.email')}

TRANSLATION KEY PATTERNS:
- Common actions: common.save, common.cancel, common.delete, common.edit
- Auth: auth.login, auth.register, auth.logout, auth.email, auth.password
- Profile: profile.title, profile.editProfile, profile.changePassword
- Home: home.title, home.welcome, home.expiringItems
- Fridge: fridge.title, fridge.addItem, fridge.editItem
- Shopping: shopping.title, shopping.addItem, shopping.purchased
- Meal: meal.title, meal.addMeal, meal.breakfast
- Cookbook: cookbook.title, cookbook.addRecipe, cookbook.ingredients
- Errors: errors.networkError, errors.invalidInput

EXAMPLE CONVERSION:
Before:
  <Text>Đăng nhập</Text>
  Alert.alert('Lỗi', 'Vui lòng nhập email');

After:
  <Text>{t('auth.login')}</Text>
  Alert.alert(t('common.error'), t('auth.emailRequired'));

All translation keys are defined in:
- locales/en.json
- locales/vi.json
*/

export const translationGuide = {
  status: 'completed',
  components: {
    updated: ['Profile.tsx', 'CookbookView.tsx', 'RecipeDetailModal.tsx'],
    pending: [
      'Login.tsx',
      'Home.tsx', 
      'Fridge.tsx',
      'ShoppingList.tsx',
      'MealPlanner.tsx',
      'SuggestionView.tsx',
      'All modals'
    ]
  }
};
