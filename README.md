
  # MercApp Mobile Design

  This is a code bundle for MercApp Mobile Design. The original project is available at https://www.figma.com/design/7DGYB7LgRGA53nalxNp9IZ/MercApp-Mobile-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Dependencies

  ### Core Dependencies
  - **React 18.3.1**: UI framework
  - **TypeScript**: Type safety
  - **Vite**: Build tool and dev server

  ### UI & Styling
  - **Tailwind CSS**: Utility-first CSS framework
  - **Motion (Framer Motion)**: Animation library
  - **Radix UI**: Accessible component primitives
  - **Lucide React**: Icon library

  ### Feature-Specific Dependencies
  - **date-fns 4.1.0**: Date manipulation utilities (used for purchase history filters)
  - **react-day-picker 8.10.1**: Calendar component for date selection
  - **use-debounce 10.0.6**: Debounce hook for search input (used in advanced filters)
  - **vaul 1.1.2**: Bottom sheet/drawer component for mobile filter panel

  ### Testing
  - **Vitest 4.0.16**: Test runner
  - **React Testing Library**: Component testing utilities
  - **@testing-library/jest-dom**: DOM matchers for tests

  ## Features

  ### Purchase History Filters
  Advanced filtering system for purchase history with:
  - Date range filtering (quick presets + custom calendar)
  - Multiple sort criteria (date, amount, items)
  - Advanced search by product name
  - Price range filtering
  - Pagination with smooth loading
  - Filter persistence (localStorage + URL sync)

  See `src/components/filters/README.md` for detailed documentation.
  