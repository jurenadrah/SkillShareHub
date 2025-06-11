import { render, screen, waitFor } from '@testing-library/react'
import TutorProfile from '../TutorProfile'

// Mock supabase to prevent real API calls
jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: { getUser: jest.fn() },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => ({}),
                    order: () => ({ ascending: () => ({}) }),
                }),
                order: () => ({ ascending: () => ({}) }),
            }),
            update: () => ({ eq: () => ({}) }),
            insert: () => ({ select: () => ({}) }),
            delete: () => ({ eq: () => ({}) }),
        }),
        storage: {
            from: () => ({
                upload: jest.fn(),
                getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: '' } }),
            }),
        },
    },
}))

import { act, fireEvent } from '@testing-library/react'


describe('TutorProfile', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders loading initially', () => {
        require('@/lib/supabase').supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
        render(<TutorProfile />)
        expect(screen.getByText(/Nalaganje/i)).toBeInTheDocument()
    })

    it('shows "Ni najdenega tutor profila." if no user', async () => {
        require('@/lib/supabase').supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
        render(<TutorProfile />)
        await waitFor(() => {
            expect(screen.getByText(/Ni najdenega tutor profila/i)).toBeInTheDocument()
        })
    })

    it('renders tutor profile info when user is a tutor', async () => {
        require('@/lib/supabase').supabase.auth.getUser.mockResolvedValue({ data: { user: { email: mockUser.email } } })
        require('@/lib/supabase').supabase.from = jest.fn().mockImplementation((table: string) => {
            if (table === 'Uporabniki') {
                return {
                    select: () => ({
                        eq: () => ({
                            single: () => Promise.resolve({ data: mockUser }),
                        }),
                    }),
                }
            }
            if (table === 'Ocene') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Predmeti') {
                return {
                    select: () => ({
                        order: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Tip_predmeta') {
                return {
                    select: () => Promise.resolve({ data: [] }),
                }
            }
            if (table === 'Uporabniki_has_Predmeti') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Event') {
                return {
                    select: () => ({
                        eq: () => ({
                            order: () => ({
                                order: () => Promise.resolve({ data: [] }),
                            }),
                        }),
                    }),
                }
            }
            if (table === 'Bannerji') {
                return {
                    select: () => ({
                        order: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            return {}
        })

        render(<TutorProfile />)
        await waitFor(() => {
            expect(screen.getByText(/Janez Novak/)).toBeInTheDocument()
            expect(screen.getByText(/Moji bannerji/)).toBeInTheDocument()
            expect(screen.getByText(/Predmeti/)).toBeInTheDocument()
            expect(screen.getByText(/Urnik/)).toBeInTheDocument()
            expect(screen.getByText(/Komentarji in ocene/)).toBeInTheDocument()
        })
    })

    it('shows "Predmeti" section and toggles edit mode', async () => {
        require('@/lib/supabase').supabase.auth.getUser.mockResolvedValue({ data: { user: { email: mockUser.email } } })
        require('@/lib/supabase').supabase.from = jest.fn().mockImplementation((table: string) => {
            if (table === 'Uporabniki') {
                return {
                    select: () => ({
                        eq: () => ({
                            single: () => Promise.resolve({ data: mockUser }),
                        }),
                    }),
                }
            }
            if (table === 'Ocene') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Predmeti') {
                return {
                    select: () => ({
                        order: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Tip_predmeta') {
                return {
                    select: () => Promise.resolve({ data: [] }),
                }
            }
            if (table === 'Uporabniki_has_Predmeti') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Event') {
                return {
                    select: () => ({
                        eq: () => ({
                            order: () => ({
                                order: () => Promise.resolve({ data: [] }),
                            }),
                        }),
                    }),
                }
            }
            if (table === 'Bannerji') {
                return {
                    select: () => ({
                        order: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            return {}
        })

        await act(async () => {
            render(<TutorProfile />)
        })

        await waitFor(() => {
            expect(screen.getByText(/Predmeti/)).toBeInTheDocument()
        })

        const editButton = screen.getByText(/Uredi predmete/)
        act(() => {
            fireEvent.click(editButton)
        })

        expect(screen.getByText(/Prekliči/)).toBeInTheDocument()
    })

    it('shows "Urnik" section and toggles edit mode', async () => {
        require('@/lib/supabase').supabase.auth.getUser.mockResolvedValue({ data: { user: { email: mockUser.email } } })
        require('@/lib/supabase').supabase.from = jest.fn().mockImplementation((table: string) => {
            if (table === 'Uporabniki') {
                return {
                    select: () => ({
                        eq: () => ({
                            single: () => Promise.resolve({ data: mockUser }),
                        }),
                    }),
                }
            }
            if (table === 'Ocene') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Predmeti') {
                return {
                    select: () => ({
                        order: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Tip_predmeta') {
                return {
                    select: () => Promise.resolve({ data: [] }),
                }
            }
            if (table === 'Uporabniki_has_Predmeti') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Event') {
                return {
                    select: () => ({
                        eq: () => ({
                            order: () => ({
                                order: () => Promise.resolve({ data: [] }),
                            }),
                        }),
                    }),
                }
            }
            if (table === 'Bannerji') {
                return {
                    select: () => ({
                        order: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            return {}
        })

        await act(async () => {
            render(<TutorProfile />)
        })

        await waitFor(() => {
            expect(screen.getByText(/Urnik/)).toBeInTheDocument()
        })

        const editButton = screen.getByText(/Uredi urnik/)
        act(() => {
            fireEvent.click(editButton)
        })

        expect(screen.getByText(/Prekliči/)).toBeInTheDocument()
    })
})

const mockUser = {
    id: 1,
    ime: 'Janez',
    priimek: 'Novak',
    email: 'janez@novak.si',
    bio: 'Testni bio',
    profilna_slika: null,
    tutor: true,
    zoom_link: 'https://zoom.us/test',
    tocke: 100,
    aktiven_banner: null,
}

describe('TutorProfile', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders loading initially', () => {
        require('@/lib/supabase').supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
        render(<TutorProfile />)
        expect(screen.getByText(/Nalaganje/i)).toBeInTheDocument()
    })

    it('shows "Ni najdenega tutor profila." if no user', async () => {
        require('@/lib/supabase').supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
        render(<TutorProfile />)
        await waitFor(() => {
            expect(screen.getByText(/Ni najdenega tutor profila/i)).toBeInTheDocument()
        })
    })

    it('renders tutor profile info when user is a tutor', async () => {
        require('@/lib/supabase').supabase.auth.getUser.mockResolvedValue({ data: { user: { email: mockUser.email } } })
        require('@/lib/supabase').supabase.from = jest.fn().mockImplementation((table: string) => {
            if (table === 'Uporabniki') {
                return {
                    select: () => ({
                        eq: () => ({
                            single: () => Promise.resolve({ data: mockUser }),
                        }),
                    }),
                }
            }
            if (table === 'Ocene') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Predmeti') {
                return {
                    select: () => ({
                        order: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Tip_predmeta') {
                return {
                    select: () => Promise.resolve({ data: [] }),
                }
            }
            if (table === 'Uporabniki_has_Predmeti') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            if (table === 'Event') {
                return {
                    select: () => ({
                        eq: () => ({
                            order: () => ({
                                order: () => Promise.resolve({ data: [] }),
                            }),
                        }),
                    }),
                }
            }
            if (table === 'Bannerji') {
                return {
                    select: () => ({
                        order: () => Promise.resolve({ data: [] }),
                    }),
                }
            }
            return {}
        })

        render(<TutorProfile />)
        await waitFor(() => {
            expect(screen.getByText(/Janez Novak/)).toBeInTheDocument()
            expect(screen.getByText(/Moji bannerji/)).toBeInTheDocument()
            expect(screen.getByText(/Predmeti/)).toBeInTheDocument()
            expect(screen.getByText(/Urnik/)).toBeInTheDocument()
            expect(screen.getByText(/Komentarji in ocene/)).toBeInTheDocument()
        })
    }) 
})