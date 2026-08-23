import { createContext, useState, type PropsWithChildren } from "react";


export interface descriptionContextValues {
    descriptionNames: string[],
    setDescriptionNames: (names: string[]) => void,
    toggleName: (name: string) => void,
}

export const DescriptionContext = createContext<descriptionContextValues>({} as any);



export const DescriptionProvider = ({ children }: PropsWithChildren) => {
    const [descriptionNames, setDescriptionNames] = useState<string[]>([])

    const toggleName = (name: string) => {
        setDescriptionNames((names) => {
            if (names.some(n => n == name)) {
                return names.filter(n => n !== name)
            }
            return [...names, name]
        })
    }


    return <DescriptionContext.Provider value={{ descriptionNames, setDescriptionNames, toggleName }}>
        {children}
    </DescriptionContext.Provider>

}