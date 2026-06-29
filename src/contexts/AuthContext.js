import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import {
  signUp as apiSignUp,
  signIn as apiSignIn,
  signOut as apiSignOut,
  exchangeSession as apiExchangeSession,
  resetPassword as apiResetPassword,
  getSession,
  updateProfile as apiUpdateProfile,
} from '../lib/api';

const AuthContext = createContext(undefined);

function getApiErrorMessage(error) {
  const data = error?.response?.data;
  const nestedError = data?.error;
  const raw =
    data?.message ||
    (typeof nestedError === 'string' ? nestedError : nestedError?.message) ||
    error?.message ||
    'Request failed';
  return raw === '{}' ? 'Could not create account. Please try again.' : raw;
}

const initialState = {
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
  profile: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile ?? state.profile,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const refreshMe = useCallback(async () => {
    const response = await getSession();
    return response.data;
  }, []);

  const applySession = useCallback((data) => {
    if (!data?.authenticated || !data?.user) {
      return false;
    }

    dispatch({
      type: 'SET_USER',
      payload: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        },
        profile: data.profile,
      },
    });
    return true;
  }, []);

  const applySignInResponse = useCallback((signinData) => {
    if (!signinData?.authenticated || !signinData?.user) {
      return false;
    }

    dispatch({
      type: 'SET_USER',
      payload: {
        user: {
          id: signinData.user.id,
          email: signinData.user.email,
          name: signinData.user.name,
          role: signinData.user.role,
        },
        profile: signinData.profile || {
          id: signinData.user.id,
          email: signinData.user.email,
          name: signinData.user.name,
          is_admin: signinData.user.role === 'ADMIN',
        },
      },
    });
    return true;
  }, []);

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const data = await refreshMe();
        if (!applySession(data)) {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (_error) {
        dispatch({ type: 'LOGOUT' });
      }
    };

    bootstrapSession();
  }, [refreshMe, applySession]);

  const signUp = useCallback(async (email, password, name) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiSignUp(email, password, name);

      if (response.data?.authenticated) {
        const data = await refreshMe();
        applySession(data);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: message });
      return { error: message };
    }
  }, [refreshMe, applySession]);

  const signIn = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const signInResponse = await apiSignIn(email, password);
      const signinData = signInResponse.data;

      const sessionData = await refreshMe();
      if (applySession(sessionData) || applySignInResponse(signinData)) {
        return { authenticated: true };
      }

      throw new Error('Signed in but session could not be established. Please try again.');
    } catch (error) {
      const message = getApiErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: message });
      return { error: message };
    }
  }, [refreshMe, applySession, applySignInResponse]);

  const establishSessionFromTokens = useCallback(async (tokens) => {
    const exchangeResponse = await apiExchangeSession(tokens);
    const exchangeData = exchangeResponse.data;

    const sessionData = await refreshMe();
    if (applySession(sessionData) || applySignInResponse(exchangeData)) {
      return;
    }

    throw new Error('Session exchange failed');
  }, [refreshMe, applySession, applySignInResponse]);

  const updateProfile = useCallback(async (payload) => {
    try {
      const response = await apiUpdateProfile(payload);
      dispatch({ type: 'SET_PROFILE', payload: response.data });
      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: message });
      return { error: message };
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      const response = await apiResetPassword(email);
      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      return { error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiSignOut();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const value = useMemo(() => ({
    ...state,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    refreshMe,
    establishSessionFromTokens,
    dispatch,
  }), [state, signUp, signIn, signOut, updateProfile, resetPassword, refreshMe, establishSessionFromTokens]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
