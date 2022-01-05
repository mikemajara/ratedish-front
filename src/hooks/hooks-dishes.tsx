import React, { useEffect, useState } from "react";
import { Dish, Restaurant } from "@prisma/client";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import ky from "ky";
import { DishInclude, RestaurantInclude } from "prisma/model";
import { Comment } from "@prisma/client";
import { logger } from "@lib/logger";

export const useAllDishes = () => {
  const [result, setResult] = useState<DishInclude[]>([]);
  const { data, isLoading, error } = useQuery<DishInclude[]>(
    "/api/dishes",
    () => ky.get("/api/dishes").json(),
    { onSuccess: (data) => setResult(data) },
  );
  return { data: result, isLoading, error };
};

export const useDish = (id) => {
  const [result, setResult] = useState<DishInclude>();
  const { data, isLoading, error } = useQuery<DishInclude>(
    `/api/dishes/${id}`,
    () => ky.get(`/api/dishes/${id}`).json(),
    { onSuccess: (data) => setResult(data), enabled: !!id },
  );
  return { data: result, isLoading, error };
};

export const useDishComment = (dishId) => {
  const [result, setResult] = useState<Comment>();
  const { data, isLoading, error } = useQuery<Comment>(
    `/api/comments?dishId=${dishId}`,
    () => ky.get(`/api/comments?dishId=${dishId}`).json(),
    {
      onSuccess: (data) => setResult(data),
      enabled: !!dishId,
    },
  );
  return { data: result, isLoading, error };
};

export const useSaveRating = (dishId) => {
  return useMutation((json) => {
    return ky.post(`/api/dishes/rate/${dishId}`, { json });
  });
};

export const useSaveComment = (dishId) => {
  const queryClient = useQueryClient();
  return useMutation(
    (json) => {
      return ky.post(`/api/dishes/comment?id=${dishId}`, {
        json,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(
          `/api/comments?dishId=${dishId}`,
          {
            exact: true,
            refetchInactive: false,
          },
        );
      },
    },
  );
};
