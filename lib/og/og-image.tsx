import { ImageResponse } from 'next/og'

interface OgImageOptions {
    subtitle: string
    title: string
}

export const OG_IMAGE_SIZE = {
    height: 630,
    width: 1200,
} as const

export function createOgImage({ subtitle, title }: OgImageOptions) {
    return new ImageResponse(
        <div
            style={{
                background:
                    'radial-gradient(circle at top, rgba(10,200,185,0.18), transparent 28%), radial-gradient(circle at 20% 20%, rgba(244,201,93,0.14), transparent 20%), linear-gradient(180deg, #07111f 0%, #060e1a 48%, #07111f 100%)',
                color: '#f7fbff',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
                padding: '64px',
                width: '100%',
            }}>
            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: '20px',
                }}>
                <div
                    style={{
                        alignItems: 'center',
                        background:
                            'linear-gradient(180deg, rgba(16,32,51,0.9) 0%, rgba(7,17,31,0.95) 100%)',
                        border: '1px solid rgba(125, 211, 252, 0.28)',
                        borderRadius: '24px',
                        boxShadow: '0 12px 34px rgba(0,0,0,0.28)',
                        display: 'flex',
                        height: '88px',
                        justifyContent: 'center',
                        width: '88px',
                    }}>
                    <div
                        style={{
                            background: '#0ac8b9',
                            borderRadius: '999px',
                            boxShadow: '0 0 22px rgba(10,200,185,0.45)',
                            height: '22px',
                            width: '22px',
                        }}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}>
                    <div
                        style={{
                            color: '#7dd3fc',
                            display: 'flex',
                            fontSize: '22px',
                            fontWeight: 700,
                            letterSpacing: '0.28em',
                            textTransform: 'uppercase',
                        }}>
                        StatBox
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            fontSize: '24px',
                            opacity: 0.78,
                        }}>
                        League of Legends OBS Widget
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    maxWidth: '840px',
                }}>
                <div
                    style={{
                        display: 'flex',
                        fontSize: '74px',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                    }}>
                    {title}
                </div>
                <div
                    style={{
                        color: '#adc4db',
                        display: 'flex',
                        fontSize: '30px',
                        lineHeight: 1.35,
                    }}>
                    {subtitle}
                </div>
            </div>

            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: '16px',
                }}>
                {['Session W/L', 'Live Rank & LP', 'Recent KDA'].map(item => (
                    <div
                        key={item}
                        style={{
                            alignItems: 'center',
                            background: 'rgba(16, 32, 51, 0.7)',
                            border: '1px solid rgba(125, 211, 252, 0.18)',
                            borderRadius: '999px',
                            color: '#f7fbff',
                            display: 'flex',
                            fontSize: '22px',
                            fontWeight: 700,
                            padding: '14px 20px',
                        }}>
                        {item}
                    </div>
                ))}
            </div>
        </div>,
        OG_IMAGE_SIZE
    )
}
