"use client"
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardTitle,
  CardDescription
} from '@/components/ui/card'



export default function Home() {
  const { loading, turnLoadingOn, turnLoadingOff } = useLoadingState()
  const { data, findBookByName } = useQueryBook()
  const [bookName, setBookName] = useState<string>("")

  function userQueriedForBook() {
    findBookByName(bookName);
  }

  function handleBookNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setBookName(event.target.value)
  }

  return (
    <main className="max-w-screen-2xl p-6">
      <Input placeholder="Search for a book" value={bookName} onChange={handleBookNameChange} />
      <Button onClick={userQueriedForBook}>Search</Button>
      <section id="books-results" className="flex justify-start flex-wrap items-center gap-2">
        {data.map(book => (
          <Card key={book.key}>
            <CardTitle>{book.name}</CardTitle>
            <CardDescription>{book.author}</CardDescription>
            <Button>See More.</Button>
          </Card>
        ))}
      </section>
    </main>
  );
}

export type UseLoadingStateHook = {
  loading: boolean,
  turnLoadingOn: () => void,
  turnLoadingOff: () => void,
}

function useLoadingState(): UseLoadingStateHook {
  const [loading, setLoading] = useState<boolean>(true)

  function turnLoadingOn() {
    setLoading(true)
  }
  function turnLoadingOff() {
    setLoading(false)
  }

  return {
    loading,
    turnLoadingOn,
    turnLoadingOff,
  }
}

export type UseQueryBookStateHook = {
  data: Book[],
  error: string,
  findBookByName: (name: string) => void,
}

function useQueryBook(): UseQueryBookStateHook {
  const [data, setData] = useState<Book[]>([]);
  const [error, setError] = useState<string>("");

  function findBookByName(name: string): void {
    fetch(`${process.env.NEXT_PUBLIC_OPEN_LIBRARY_URL}/search.json?q=${encodeURIComponent(name)}`)
      .then(response => response.json())
      .then(data => {
        setData(Book.array(data.docs))
      })
      .catch(error => {
        setError(error.message)
      });
  };

  return {
    data,
    error,
    findBookByName,
  }
}

class Book {
  private _author: string | string[]
  constructor(public readonly key: string, public readonly name: string, author: string) {
    this.key = key
    this.name = name
    this._author = author
  }

  static json(json: any): Book {
    return new Book(json.key, json.title, json.author_name)
  }

  static array(array: any[]): Book[] {
    return array.map(Book.json)
  }

  get author() {
    if (this._author && Array.isArray(this._author)) {
      return this._author.join()
    }
    return this._author
  }
}
