package com.toby.youngforever.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

public final class SlugUtils {

    private SlugUtils() {}

    private static final Pattern NON_LATIN   = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE  = Pattern.compile("[\\s]+");
    private static final Pattern MULTI_DASH  = Pattern.compile("-{2,}");

    /**
     * Converts a Vietnamese string to a URL-safe slug.
     * "Sữa Rửa Mặt Innisfree" → "sua-rua-mat-innisfree"
     */
    public static String slugify(String input) {
        if (input == null || input.isBlank()) return "";

        String noAccent = Normalizer.normalize(input.toLowerCase().trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                // Vietnamese specific replacements
                .replace("đ", "d").replace("Đ", "d");

        String slug = WHITESPACE.matcher(noAccent).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = MULTI_DASH.matcher(slug).replaceAll("-");

        return slug.replaceAll("^-|-$", "");
    }
}
