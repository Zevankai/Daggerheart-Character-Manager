# Multi-Panel Layout Feature

## Overview

The multi-panel layout feature allows users to have up to 3 tabs open simultaneously in a three-column layout (left, center, right). This enhances productivity by enabling users to view and interact with multiple sections of the character sheet at once.

## Features

### Panel Management
- **Three Panel Positions**: Left, Center, and Right panels
- **Dynamic Panel Selection**: Users can select which tab content to display in each panel
- **Panel Swapping**: If a tab is already open in one panel, selecting it for another panel will swap the contents
- **Panel Closing**: Each panel has a close button (×) to clear its content
- **State Persistence**: Panel configuration is saved to localStorage and restored on page reload

### Available Tabs
Users can place any of the following tabs in any panel position:
- Domain Vault
- Effects & Features
- Equipment
- Details
- Experiences
- Journal
- Downtime
- Characters
- Settings

### Controls

#### Panel Selection Dropdowns
- **Left Panel**: Dropdown to select content for the left panel
- **Center Panel**: Dropdown to select content for the center panel  
- **Right Panel**: Dropdown to select content for the right panel

#### Action Buttons
- **Reset to Single Panel**: Clears all panels and returns to traditional single-tab view
- **Toggle Panel Mode**: Switches between multi-panel and single-panel modes

### Responsive Design
- **Desktop (>1200px)**: Full three-column layout
- **Tablet (768px-1200px)**: Two-column layout with right panel spanning full width
- **Mobile (<768px)**: Single-column layout with stacked panels

## Usage

### Switching to Multi-Panel Mode
1. Click the "Switch to Multi-Panel" button
2. The current active tab will automatically appear in the center panel
3. Use the dropdown menus to select content for left and right panels

### Managing Panels
1. **Adding Content**: Select a tab from any panel's dropdown menu
2. **Swapping Panels**: If you select a tab that's already open, it will swap with the current panel's content
3. **Closing Panels**: Click the × button in a panel's header to clear its content
4. **Resetting**: Use "Reset to Single Panel" to return to traditional view

### Switching Back to Single Panel
1. Click "Reset to Single Panel" to clear all panels and return to traditional view
2. Or click "Switch to Single Panel" (when in multi-panel mode) to toggle back

## Technical Implementation

### Files Modified
- `index.html`: Added multi-panel layout structure and controls
- `assets/css/main.css`: Added multi-panel styles and responsive design
- `assets/js/utils/multiPanel.js`: New JavaScript module for panel management
- `assets/js/utils/script.js`: Updated tab switching logic to work with multi-panel system

### Key Components

#### MultiPanelManager Class
- Manages panel state and configuration
- Handles content cloning and ID conflict resolution
- Provides panel initialization and content management
- Implements state persistence using localStorage

#### CSS Classes
- `.multi-panel-active`: Applied when in multi-panel mode
- `.single-panel-active`: Applied when in single-panel mode
- `.panel-container`: Individual panel styling
- `.panel-content`: Content area within each panel

### State Management
Panel configuration is automatically saved to localStorage under the key `zevi-multi-panel-state` and includes:
- Panel positions and their assigned tab IDs
- Multi-panel mode status
- Panel content references

## Browser Compatibility
- Modern browsers with ES6+ support
- CSS Grid for layout
- localStorage for state persistence
- Responsive design with CSS media queries

## Future Enhancements
Potential improvements could include:
- Drag and drop panel reordering
- Panel resizing capabilities
- Custom panel layouts (2x2 grid, etc.)
- Panel content synchronization
- Keyboard shortcuts for panel management