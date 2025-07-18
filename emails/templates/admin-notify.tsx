import { Layout } from "../components/layout"


interface NoticeProps {
    body: string
    user?: string
    stack: string
    url: string
}

export const NotifyAdmin: React.FC<NoticeProps> = ({ body, user, stack, url }) => {
    const date = new Date
    return (
        <Layout
            title={`Błąd na stronie gotpage - ${date}`}
            previewText={`Błąd na stronie ${url}`}
            headerProps={{
                logoUrl: "https://gotpage.pl/logo-emails.png?text=Gotpage",
                logoAlt: "Logo gotpage",
            }}
            userName="Błąd"
        >
            <div>
                <h1>Błąd ma stronie : {url}</h1>
                <p>Błąd:<br /> {body}</p>
                <p>Stack:<br /> {stack}</p>
                {user &&
                    <div>
                        <p>User data: {user}</p>
                    </div>
                }
            </div>
        </Layout>
    )
}