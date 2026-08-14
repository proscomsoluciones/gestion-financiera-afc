<?php

namespace App\Http\Controllers;

use App\Models\Club;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ClubController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Club::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('short_name', 'like', "%{$search}%")
                  ->orWhere('president_name', 'like', "%{$search}%")
                  ->orWhere('stadium_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $clubs = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Clubs/Index', [
            'clubs' => $clubs,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Clubs/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:clubs,slug',
            'short_name' => 'nullable|string|max:255',
            'crest' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'founded_at' => 'nullable|date',
            'stadium_name' => 'nullable|string|max:255',
            'stadium_address' => 'nullable|string|max:255',
            'stadium_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'history' => 'nullable|string',
            'president_name' => 'nullable|string|max:255',
            'secretary_name' => 'nullable|string|max:255',
            'treasurer_name' => 'nullable|string|max:255',
            'categories' => 'nullable|array',
            'gallery' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if ($request->hasFile('crest')) {
            $validated['crest'] = $request->file('crest')->store('clubs/crests', 'public');
        }

        if ($request->hasFile('stadium_image')) {
            $validated['stadium_image'] = $request->file('stadium_image')->store('clubs/stadiums', 'public');
        }

        Club::create($validated);

        return redirect()->route('clubs.index')->with('success', 'Club registrado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Club $club): Response
    {
        return Inertia::render('Clubs/Show', [
            'club' => $club,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Club $club): Response
    {
        return Inertia::render('Clubs/Edit', [
            'club' => $club,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Club $club): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:clubs,slug,' . $club->id,
            'short_name' => 'nullable|string|max:255',
            'crest' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'founded_at' => 'nullable|date',
            'stadium_name' => 'nullable|string|max:255',
            'stadium_address' => 'nullable|string|max:255',
            'stadium_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'history' => 'nullable|string',
            'president_name' => 'nullable|string|max:255',
            'secretary_name' => 'nullable|string|max:255',
            'treasurer_name' => 'nullable|string|max:255',
            'categories' => 'nullable|array',
            'gallery' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if ($request->hasFile('crest')) {
            if ($club->crest && !str_starts_with($club->crest, 'http')) {
                Storage::disk('public')->delete($club->crest);
            }
            $validated['crest'] = $request->file('crest')->store('clubs/crests', 'public');
        }

        if ($request->hasFile('stadium_image')) {
            if ($club->stadium_image && !str_starts_with($club->stadium_image, 'http')) {
                Storage::disk('public')->delete($club->stadium_image);
            }
            $validated['stadium_image'] = $request->file('stadium_image')->store('clubs/stadiums', 'public');
        }

        $club->update($validated);

        return redirect()->route('clubs.index')->with('success', 'Información del club actualizada correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Club $club): RedirectResponse
    {
        if ($club->crest && !str_starts_with($club->crest, 'http')) {
            Storage::disk('public')->delete($club->crest);
        }
        if ($club->stadium_image && !str_starts_with($club->stadium_image, 'http')) {
            Storage::disk('public')->delete($club->stadium_image);
        }

        $club->delete();

        return redirect()->route('clubs.index')->with('success', 'El club ha sido eliminado.');
    }
}
