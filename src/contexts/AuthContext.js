import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import {
  signUp as apiSignUp,
  signIn as apiSignIn,
  signOut as apiSignOut,
  refreshSession as apiRefreshSession,
  getMe,
  updateProfile as apiUpdateProfile,
} from '../lib/api';

const AuthContext = createContext(undefined);

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.message ||
    'Request failed'
  );
}

const initialState = {
  user: null,
  session: null,
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
        session: action.payload.session,
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
    const response = await getMe();
    return response.data;
  }, []);

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = localStorage.getItem('supabase_token');
      const refreshToken = localStorage.getItem('supabase_refresh_token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        const me = await refreshMe();
        dispatch({
          type: 'SET_USER',
          payload: {
            user: {
              id: me.id,
              email: me.email,
              name: me.name,
              role: me.role,
            },
            session: { access_token: token },
            profile: me.profile,
          },
        });
      } catch (_error) {
        if (refreshToken) {
          try {
            const refreshResponse = await apiRefreshSession(refreshToken);
            const nextAccessToken = refreshResponse.data?.session?.access_token;
            const nextRefreshToken = refreshResponse.data?.session?.refresh_token;

            if (nextAccessToken) {
              localStorage.setItem('supabase_token', nextAccessToken);
            }
            if (nextRefreshToken) {
              localStorage.setItem('supabase_refresh_token', nextRefreshToken);
            }

            const me = await refreshMe();
            dispatch({
              type: 'SET_USER',
              payload: {
                user: {
                  id: me.id,
                  email: me.email,
                  name: me.name,
                  role: me.role,
                },
                session: refreshResponse.data?.session || { access_token: nextAccessToken },
                profile: me.profile,
              },
            });
            return;
          } catch (_refreshError) {
            // Fall through to logout
          }
        }

        localStorage.removeItem('supabase_token');
        localStorage.removeItem('supabase_refresh_token');
        dispatch({ type: 'LOGOUT' });
      }
    };

    bootstrapSession();
  }, [refreshMe]);

  const signUp = useCallback(async (email, password, name) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiSignUp(email, password, name);

      if (response.data?.session?.access_token) {
        localStorage.setItem('supabase_token', response.data.session.access_token);
        if (response.data?.session?.refresh_token) {
          localStorage.setItem('supabase_refresh_token', response.data.session.refresh_token);
        }
        const me = await refreshMe();
        dispatch({
          type: 'SET_USER',
          payload: {
            user: {
              id: me.id,
              email: me.email,
              name: me.name,
              role: me.role,
            },
            session: response.data.session,
            profile: me.profile,
          },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }

      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: message });
      return { error: message };
    }
  }, [refreshMe]);

  const signIn = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiSignIn(email, password);

      if (response.data?.session?.access_token) {
        localStorage.setItem('supabase_token', response.data.session.access_token);
        if (response.data?.session?.refresh_token) {
          localStorage.setItem('supabase_refresh_token', response.data.session.refresh_token);
        }
      }

      const me = await refreshMe();
      dispatch({
        type: 'SET_USER',
        payload: {
          user: {
            id: me.id,
            email: me.email,
            name: me.name,
            role: me.role,
          },
          session: response.data.session,
          profile: me.profile,
        },
      });

      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      dispatch({ type: 'SET_ERROR', payload: message });
      return { error: message };
    }
  }, [refreshMe]);

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

  const signOut = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiSignOut();
      localStorage.removeItem('supabase_token');
      localStorage.removeItem('supabase_refresh_token');
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
    refreshMe,
    dispatch,
  }), [state, signUp, signIn, signOut, updateProfile, refreshMe]);

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
