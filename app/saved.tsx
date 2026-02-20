import React from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderBar } from "@/components/HeaderBar";
import { RecipeCard } from "@/components/RecipeCard";
import { useSavedRecipes, useUnsaveRecipe } from "@/hooks/useSavedRecipes";
import { queryKeys } from "@/lib/queryKeys";
import { Colors } from "@/constants/colors";

/**
 * Saved recipes screen.
 *
 * Server state: useSavedRecipes query
 * Handles loading, error, and empty states explicitly.
 */
export default function SavedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const unsaveMutation = useUnsaveRecipe();
  const { data: recipes, isLoading, isError, error } = useSavedRecipes();

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <HeaderBar title="Saved Recipes" showBack />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.warm} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-xl">
          <Text className="font-body text-sm text-txt-soft text-center">
            Something went wrong loading your recipes.{"\n"}
            {error?.message}
          </Text>
        </View>
      ) : !recipes || recipes.length === 0 ? (
        <View className="flex-1 items-center justify-center px-xl">
          <Text className="text-4xl mb-4">{"\u2764\uFE0F"}</Text>
          <Text className="font-display text-lg text-txt text-center">
            No saved recipes yet
          </Text>
          <Text className="font-body text-xs text-txt-soft text-center mt-2">
            Tap the heart on any recipe to save it here.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-xl"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {recipes.map((recipe, i) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              index={i}
              saved
              onPress={() => {
                queryClient.setQueryData(
                  queryKeys.recipes.detail(recipe.id),
                  recipe
                );
                router.push({
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  pathname: "/result" as any,
                  params: { recipeId: recipe.id },
                });
              }}
              onToggleSave={() => unsaveMutation.mutate(recipe.id)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
