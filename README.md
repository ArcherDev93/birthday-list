# 🎂 Birthday List App

A collaborative birthday tracking application built with Next.js, TypeScript, and Tailwind CSS. Perfect for families to keep track of children's birthdays and share lists with others.

## Features

- ✨ **Add & Edit Birthdays**: Easily add new birthdays or edit existing ones
- 🎯 **Smart Sorting**: Automatically sorts birthdays by how soon they're coming up
- 🎉 **Today's Birthdays**: Special highlighting for birthdays happening today
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 💾 **Local Storage**: Your data is saved locally in your browser
- 🔗 **Share Lists**: Generate shareable links to send to family and friends
- 🎨 **Kid-Friendly Design**: Colorful, intuitive interface with emoji indicators

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd birthday-list
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Birthdays

1. Click the "Add Birthday" button
2. Enter the child's name and birth date
3. Click "Add Birthday" to save

### Editing Birthdays

1. Click the "Edit" button on any birthday card
2. Update the information
3. Click "Update Birthday" to save changes

### Sharing Your List

1. Click the "Share List" button
2. Copy the generated link or use the native share feature
3. Send the link to family and friends
4. Recipients can import the list by visiting the link

### Data Storage

- All birthday data is stored locally in your browser
- Data persists between sessions
- No external database or account required

## Technical Details

### Built With

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **React 19** - Latest React features

### Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── BirthdayCard.tsx    # Individual birthday display
│   ├── BirthdayForm.tsx    # Add/edit form
│   └── BirthdayList.tsx    # Main app component
├── types/              # TypeScript type definitions
│   └── birthday.ts     # Birthday data types
└── utils/              # Utility functions
    └── birthday.ts     # Birthday calculations
```

### Key Features Implementation

#### Birthday Calculations

- Automatic age calculation based on current date
- Days until next birthday calculation
- Handles leap years and edge cases

#### Data Persistence

- Uses browser localStorage for data persistence
- Automatic save on data changes
- Import/export functionality via URL parameters

#### Responsive Design

- Mobile-first approach with Tailwind CSS
- Grid layouts that adapt to screen size
- Touch-friendly interface for mobile devices

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

The app is designed to be easily extensible. Common enhancement areas:

1. **Additional Fields**: Add photos, favorite colors, gift ideas
2. **Notifications**: Browser notifications for upcoming birthdays
3. **Themes**: Additional color schemes or seasonal themes
4. **Export Options**: PDF generation, calendar integration
5. **Social Features**: Comments, birthday wishes

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Privacy & Security

- No data is sent to external servers
- All data remains in your browser's local storage
- Shared links contain data in URL parameters (be mindful when sharing)
- No user accounts or personal information required

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Try clearing your browser's local storage
3. Ensure you're using a modern browser
4. Create an issue in the repository for bugs or feature requests
