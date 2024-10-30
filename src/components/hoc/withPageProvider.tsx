import React from 'react';
import { Provider } from 'react-redux';
import { configureStore, Reducer } from '@reduxjs/toolkit';
import { audioMiddleware } from 'store/middleware/audioMiddleware';

/**
 * HOC that provides Redux store at the page level
 * @param WrappedComponent - The component to wrap
 * @param reducer - The reducer for this page's store
 * @param reducerPath - The path in the store where this reducer's state will live
 */
export const withPageProvider = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  reducer: Reducer,
  reducerPath: string
) => {
  // Create store specific to this page
  const store = configureStore({
    reducer: {
      [reducerPath]: reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types in serializability check
          ignoredActions: ['player/addPlayer', 'player/updatePlayerState'],
          // Ignore these field paths in state serialization check
          ignoredPaths: ['player.tracks'],
        },
      }) as any,  // Type assertion to bypass middleware type checking
  });

  // Return new component with store provider
  const WithPageProvider: React.FC<P> = (props) => {
    return (
      <Provider store={store}>
        <WrappedComponent {...props} />
      </Provider>
    );
  };

  // Set display name for debugging
  WithPageProvider.displayName = `WithPageProvider(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithPageProvider;
};