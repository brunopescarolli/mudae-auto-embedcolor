#Requires AutoHotkey v2.0

arquivo := A_ScriptDir "\comandos.txt"

if !FileExist(arquivo) {
    MsgBox("Arquivo não encontrado:`n" arquivo)
    ExitApp
}

lines := []
texto := FileRead(arquivo, "UTF-8")
for linha in StrSplit(texto, Chr(10), Chr(13)) {
    if Trim(linha) != ""
        lines.Push(linha)
}

if lines.Length = 0 {
    MsgBox("O arquivo está vazio:`n" arquivo)
    ExitApp
}

MsgBox("Carregados: " lines.Length " comandos")
i := 1

#HotIf WinActive("ahk_exe Discord.exe")
F8:: {
    global i
    if (i > lines.Length) {
        ToolTip("Acabaram os comandos")
        SetTimer(() => ToolTip(), -1500)
        return
    }
    A_Clipboard := lines[i]
    Send("^v")
    Sleep(150)
    Send("{Enter}")
    ToolTip(i "/" lines.Length)
    SetTimer(() => ToolTip(), -1000)
    i++
}
#HotIf