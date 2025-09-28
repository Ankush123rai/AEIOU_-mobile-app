import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Progress = { listening: number; speaking: number; reading: number; writing: number; };
type User = { name?: string; email?: string; photo?: string; progress: Progress; };

const initialState: { user: User | null } = { user: null };

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(s, a: PayloadAction<User>) { s.user = a.payload; },
    updateProgress(s, a: PayloadAction<Partial<Progress>>) {
      if (!s.user) return;
      s.user.progress = { ...s.user.progress, ...a.payload };
    }
  }
});

export const { setUser, updateProgress } = slice.actions;
export default slice.reducer;
