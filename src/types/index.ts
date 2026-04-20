export type Gender = '남성' | '여성';
export type RoomType = '고시·원룸텔' | '쉐어하우스' | '원투룸' | '상관없어요';

export interface UserInfo {
  phone: string;
  gender: Gender;
  age: string;
  password: string;
  createdAt: string;
}

export interface RoomRequest {
  phone: string;
  period: {
    recStart: string; recEnd: string; recUndecided: boolean;
    moveInStart: string; moveInEnd: string; moveInUndecided: boolean;
  };
  location: { gu: string[]; dong: string[] };
  deposit: { min: number; max: number };
  monthlyRent: { min: number; max: number };
  roomTypes: RoomType[];
  additionalNotes: string;
  active: boolean;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  url: string;
  gu: string;
  dong: string;
  deposit: number;
  monthlyRent: number;
}
