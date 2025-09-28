import React from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
// import { QueryProvider } from './providers/QueryProvider';
import { StoreProvider, store } from '../state/store';
import RootNavigator from './navigation/RootNavigator';
// import theme from '../config/theme';

export default function App() {
  return (
    <Provider store={store}>
      <StoreProvider>
        {/* <QueryProvider> */}
          <PaperProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </PaperProvider>
        {/* </QueryProvider> */}
      </StoreProvider>
    </Provider>
  );
}
